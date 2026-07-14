import { describe, expect, it, vi } from 'vitest'
import { clickButtonByText, renderReactElement } from '../../test/domTestUtils'
import FilterPanelActions from './FilterPanelActions'

describe('FilterPanelActions', () => {
  it('renders reset and apply actions and forwards clicks', () => {
    const onReset = vi.fn()
    const onApply = vi.fn()
    const rendered = renderReactElement(
      <FilterPanelActions
        resetLabel="重置"
        applyLabel="应用筛选"
        onReset={onReset}
        onApply={onApply}
      />,
    )
    const { container } = rendered

    clickButtonByText(container, '重置')
    clickButtonByText(container, '应用筛选')

    expect(onReset).toHaveBeenCalledTimes(1)
    expect(onApply).toHaveBeenCalledTimes(1)
    expect(container.firstElementChild?.className).toContain('sticky')
    expect(container.firstElementChild?.className).toContain('bottom-0')
    expect(container.firstElementChild?.className).toContain('safe-area-inset-bottom')

    rendered.unmount()
  })
})
