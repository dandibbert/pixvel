import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderReactElement } from '../test/domTestUtils'
import { useEventListener } from './useEventListener'

function EventProbe({
  target,
  onPing,
}: {
  target: EventTarget | null
  onPing: EventListener
}) {
  useEventListener(target, 'ping', onPing)
  return null
}

function renderEventProbe(target: EventTarget | null, onPing: EventListener) {
  return renderReactElement(<EventProbe target={target} onPing={onPing} />)
}

describe('useEventListener', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('attaches the listener to the target and removes it on unmount', () => {
    const target = new EventTarget()
    const onPing = vi.fn()
    const { unmount } = renderEventProbe(target, onPing)

    act(() => {
      target.dispatchEvent(new Event('ping'))
    })

    expect(onPing).toHaveBeenCalledTimes(1)

    unmount()

    act(() => {
      target.dispatchEvent(new Event('ping'))
    })

    expect(onPing).toHaveBeenCalledTimes(1)
  })

  it('uses the latest listener after rerender without requiring manual cleanup code', () => {
    const target = new EventTarget()
    const firstListener = vi.fn()
    const secondListener = vi.fn()
    const { root, unmount } = renderEventProbe(target, firstListener)

    act(() => {
      root.render(<EventProbe target={target} onPing={secondListener} />)
    })

    act(() => {
      target.dispatchEvent(new Event('ping'))
    })

    expect(firstListener).not.toHaveBeenCalled()
    expect(secondListener).toHaveBeenCalledTimes(1)

    unmount()
  })
})
