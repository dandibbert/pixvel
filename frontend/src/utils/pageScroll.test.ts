import { describe, expect, it, vi } from 'vitest'
import {
  restoreViewportOffset,
  scrollViewportToOffset,
  scrollViewportToTop,
  scrollViewportToTopAfterNextFrame,
} from './pageScroll'

function createFrameTarget() {
  const frames: FrameRequestCallback[] = []

  return {
    scrollTo: vi.fn(),
    cancelAnimationFrame: vi.fn(),
    requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
      frames.push(callback)
      return frames.length
    }),
    runPendingFrames() {
      const pending = frames.splice(0, frames.length)
      pending.forEach((callback) => callback(16))
    },
  }
}

describe('pageScroll', () => {
  it('scrolls the viewport to the top with smooth behavior by default', () => {
    const target = { scrollTo: vi.fn() }

    scrollViewportToTop({ target })

    expect(target.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'smooth',
    })
  })

  it('supports auto scroll behavior for reader page resets', () => {
    const target = { scrollTo: vi.fn() }

    scrollViewportToTop({ target, behavior: 'auto' })

    expect(target.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'auto',
    })
  })

  it('scrolls immediately, schedules a retry, and returns frame cleanup', () => {
    const target = {
      scrollTo: vi.fn(),
      requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
        callback(16)
        return 42
      }),
      cancelAnimationFrame: vi.fn(),
    }

    const cleanup = scrollViewportToTopAfterNextFrame({ target, behavior: 'auto' })

    expect(target.scrollTo).toHaveBeenCalledTimes(2)
    expect(target.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'auto',
    })
    expect(target.requestAnimationFrame).toHaveBeenCalledTimes(1)

    cleanup?.()

    expect(target.cancelAnimationFrame).toHaveBeenCalledWith(42)
  })

  it('scrolls to a saved offset without a negative top', () => {
    const target = { scrollTo: vi.fn() }

    scrollViewportToOffset({ offset: -10, target })

    expect(target.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
  })

  it('restores an offset immediately when the document is already tall enough', () => {
    const target = createFrameTarget()

    restoreViewportOffset({ offset: 640, target, getMaxOffset: () => 2000 })

    expect(target.scrollTo).toHaveBeenCalledWith({ top: 640, left: 0, behavior: 'auto' })
    expect(target.requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('waits for content to grow before restoring the offset', () => {
    const target = createFrameTarget()
    let maxOffset = 0

    restoreViewportOffset({ offset: 640, target, getMaxOffset: () => maxOffset })

    expect(target.scrollTo).not.toHaveBeenCalled()

    target.runPendingFrames()
    expect(target.scrollTo).not.toHaveBeenCalled()

    maxOffset = 900
    target.runPendingFrames()

    expect(target.scrollTo).toHaveBeenCalledWith({ top: 640, left: 0, behavior: 'auto' })
  })

  it('settles at the end of a document that never reaches the saved offset', () => {
    const target = createFrameTarget()

    restoreViewportOffset({ offset: 640, target, getMaxOffset: () => 100, maxAttempts: 2 })

    target.runPendingFrames()
    target.runPendingFrames()

    expect(target.scrollTo).toHaveBeenCalledTimes(1)
    expect(target.scrollTo).toHaveBeenCalledWith({ top: 100, left: 0, behavior: 'auto' })
  })

  it('stops restoring once cleaned up', () => {
    const target = createFrameTarget()

    const cleanup = restoreViewportOffset({ offset: 640, target, getMaxOffset: () => 0 })
    cleanup?.()

    expect(target.cancelAnimationFrame).toHaveBeenCalledWith(1)

    target.runPendingFrames()

    expect(target.scrollTo).not.toHaveBeenCalled()
  })

  it('does nothing without an offset to restore', () => {
    const target = createFrameTarget()

    expect(restoreViewportOffset({ offset: 0, target, getMaxOffset: () => 2000 })).toBeUndefined()
    expect(target.scrollTo).not.toHaveBeenCalled()
  })
})
