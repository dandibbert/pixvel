import { describe, expect, it, vi } from 'vitest'
import { clickButtonByText, clickElement, getElementBySelector, renderReactElement } from '../../test/domTestUtils'

const { default: FilterPanelDrawer } = await import('./FilterPanelDrawer')

function renderFilterPanelDrawer(onClose = vi.fn()) {
  return {
    ...renderReactElement(
      <FilterPanelDrawer title="筛选器" onClose={onClose}>
        <button type="button">应用筛选</button>
      </FilterPanelDrawer>,
    ),
    onClose,
  }
}

describe('FilterPanelDrawer', () => {
  it('renders the mobile-safe overlay and labeled dialog with children', () => {
    const { container, unmount } = renderFilterPanelDrawer()
    const overlay = getElementBySelector(container, '[data-testid="filter-overlay"]', HTMLElement, 'Filter drawer overlay')
    const dialog = getElementBySelector(container, '[role="dialog"]', HTMLElement, 'Filter drawer dialog')

    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-label')).toBe('筛选器')
    expect(overlay.className).toContain('z-[60]')
    expect(overlay.className).toContain('overflow-y-auto')
    expect(overlay.className).toContain('overscroll-contain')
    expect(dialog.className).toContain('max-h-[calc(100dvh-1rem)]')
    expect(dialog.className).toContain('[-webkit-overflow-scrolling:touch]')
    expect(dialog.textContent).toContain('应用筛选')

    unmount()
  })

  it('closes only when the overlay itself is clicked', () => {
    const { container, unmount, onClose } = renderFilterPanelDrawer()
    const overlay = getElementBySelector(container, '[data-testid="filter-overlay"]', HTMLElement, 'Filter drawer overlay')

    clickButtonByText(container, '应用筛选')
    expect(onClose).not.toHaveBeenCalled()

    clickElement(overlay)
    expect(onClose).toHaveBeenCalledOnce()

    unmount()
  })
})
