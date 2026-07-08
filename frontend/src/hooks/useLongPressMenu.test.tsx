import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderReactElement } from '../test/domTestUtils'
import { useLongPressMenu } from './useLongPressMenu'

interface HookSnapshot {
  isMenuOpen: boolean
  menuPosition: { x: number; y: number }
  startLongPress: (x: number, y: number) => void
  clearLongPressTimer: () => void
  cancelLongPress: () => void
  closeMenu: () => void
  consumeLongPressTrigger: () => boolean
}

let latest: HookSnapshot | null = null

function Harness() {
  latest = useLongPressMenu({ delayMs: 500 })
  return null
}

function renderHarness() {
  const rendered = renderReactElement(<Harness />)

  return {
    ...rendered,
    unmount: () => {
      rendered.unmount()
      latest = null
    },
  }
}

function getLatest() {
  if (!latest) {
    throw new Error('Hook snapshot is unavailable')
  }

  return latest
}

describe('useLongPressMenu', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    latest = null
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('opens the menu at the press position after the configured delay', () => {
    const { unmount } = renderHarness()

    act(() => {
      getLatest().startLongPress(120, 140)
    })

    expect(getLatest().isMenuOpen).toBe(false)
    expect(getLatest().menuPosition).toEqual({ x: 120, y: 140 })

    act(() => {
      vi.advanceTimersByTime(499)
    })

    expect(getLatest().isMenuOpen).toBe(false)

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(getLatest().isMenuOpen).toBe(true)
    expect(getLatest().consumeLongPressTrigger()).toBe(true)
    expect(getLatest().consumeLongPressTrigger()).toBe(false)

    unmount()
  })

  it('cancels pending presses and closes the menu without leaving a trigger behind', () => {
    const { unmount } = renderHarness()

    act(() => {
      getLatest().startLongPress(12, 24)
      getLatest().cancelLongPress()
      vi.advanceTimersByTime(500)
    })

    expect(getLatest().isMenuOpen).toBe(false)
    expect(getLatest().consumeLongPressTrigger()).toBe(false)

    act(() => {
      getLatest().startLongPress(12, 24)
      vi.advanceTimersByTime(500)
    })

    expect(getLatest().isMenuOpen).toBe(true)

    act(() => {
      getLatest().closeMenu()
    })

    expect(getLatest().isMenuOpen).toBe(false)
    expect(getLatest().consumeLongPressTrigger()).toBe(false)

    unmount()
  })
})
