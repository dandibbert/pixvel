import { describe, expect, it, vi } from 'vitest'
import { scrollViewportToTop, scrollViewportToTopAfterNextFrame } from './pageScroll'

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
})
