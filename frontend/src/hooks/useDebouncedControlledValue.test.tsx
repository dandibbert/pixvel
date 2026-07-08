import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clickButtonByText, getTextByTestId, renderReactElement } from '../test/domTestUtils'
import { useDebouncedControlledValue } from './useDebouncedControlledValue'

interface HarnessProps {
  value: string
  onChange: (value: string) => void
  debounceMs?: number
}

function Harness({ value, onChange, debounceMs = 300 }: HarnessProps) {
  const [localValue, setLocalValue] = useDebouncedControlledValue({
    value,
    onChange,
    debounceMs,
  })

  return (
    <>
      <span data-testid="value">{localValue}</span>
      <button type="button" onClick={() => setLocalValue('typed')}>
        Type
      </button>
    </>
  )
}

function renderHarness(props: HarnessProps) {
  return renderReactElement(<Harness {...props} />)
}

describe('useDebouncedControlledValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('keeps local input responsive while debouncing changes to the controlled owner', () => {
    const onChange = vi.fn()
    const { container, unmount } = renderHarness({ value: 'initial', onChange })

    expect(getTextByTestId(container, 'value')).toBe('initial')

    clickButtonByText(container, 'Type')

    expect(getTextByTestId(container, 'value')).toBe('typed')
    expect(onChange).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(299)
    })

    expect(onChange).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(onChange).toHaveBeenCalledWith('typed')
    expect(onChange).toHaveBeenCalledTimes(1)

    unmount()
  })

  it('syncs local input when the controlled value changes externally', () => {
    const onChange = vi.fn()
    const { container, root, unmount } = renderHarness({ value: 'initial', onChange })

    act(() => {
      root.render(<Harness value="external" onChange={onChange} />)
    })

    expect(getTextByTestId(container, 'value')).toBe('external')

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onChange).not.toHaveBeenCalled()

    unmount()
  })
})
