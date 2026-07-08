import { describe, expect, it, vi } from 'vitest'
import { clickElement, getElementBySelector, renderReactElement } from '../test/domTestUtils'
import SearchErrorBanner from './SearchErrorBanner'

describe('SearchErrorBanner', () => {
  it('renders the error and forwards clear clicks', () => {
    const onClear = vi.fn()
    const { container, unmount } = renderReactElement(
      <SearchErrorBanner error="Search failed" onClear={onClear} />,
    )

    expect(container.textContent).toContain('Search failed')

    const button = getElementBySelector(container, 'button', HTMLButtonElement, 'Clear button')

    clickElement(button)

    expect(onClear).toHaveBeenCalledTimes(1)

    unmount()
  })
})
