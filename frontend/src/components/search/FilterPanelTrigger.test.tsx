import { describe, expect, it, vi } from 'vitest'
import {
  clickButtonContainingText,
  getButtonContainingText,
  renderReactElement,
} from '../../test/domTestUtils'
import FilterPanelTrigger from './FilterPanelTrigger'

describe('FilterPanelTrigger', () => {
  it('opens the panel and displays the active filter count', () => {
    const onOpen = vi.fn()
    const { container, unmount } = renderReactElement(
      <FilterPanelTrigger
        title="筛选器"
        isOpen={false}
        activeFilterCount={3}
        onOpen={onOpen}
      />,
    )

    const button = getButtonContainingText(container, '筛选器')

    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(button.getAttribute('aria-haspopup')).toBe('dialog')
    expect(container.textContent).toContain('筛选器')
    expect(container.textContent).toContain('3')

    clickButtonContainingText(container, '筛选器')

    expect(onOpen).toHaveBeenCalledTimes(1)

    unmount()
  })

  it('omits the count badge when no filters are active', () => {
    const { container, unmount } = renderReactElement(
      <FilterPanelTrigger
        title="筛选器"
        isOpen={true}
        activeFilterCount={0}
        onOpen={vi.fn()}
      />,
    )

    expect(container.querySelector('button')?.getAttribute('aria-expanded')).toBe('true')
    expect(container.textContent).toBe('筛选器')

    unmount()
  })
})
