import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clickCheckboxByLabel,
  getCheckboxByLabel,
  renderReactElement,
} from '../../test/domTestUtils'
import FilterSwitchGroup from './FilterSwitchGroup'

function renderFilterSwitchGroup() {
  const onOriginalOnlyChange = vi.fn()
  const onIncludeViolationChange = vi.fn()

  return {
    ...renderReactElement(
      <FilterSwitchGroup
        title="内容筛选"
        switches={[
          {
            label: '只看原创作品',
            checked: false,
            onChange: onOriginalOnlyChange,
          },
          {
            label: '包含潜在限制作品',
            checked: true,
            onChange: onIncludeViolationChange,
          },
        ]}
      />,
    ),
    onOriginalOnlyChange,
    onIncludeViolationChange,
  }
}

describe('FilterSwitchGroup', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders switch rows with controlled checked state', () => {
    const { container, unmount } = renderFilterSwitchGroup()

    expect(container.textContent).toContain('内容筛选')
    expect(container.textContent).toContain('只看原创作品')
    expect(container.textContent).toContain('包含潜在限制作品')
    expect(getCheckboxByLabel(container, '只看原创作品').checked).toBe(false)
    expect(getCheckboxByLabel(container, '包含潜在限制作品').checked).toBe(true)

    unmount()
  })

  it('forwards switch changes as booleans', () => {
    const { container, unmount, onOriginalOnlyChange, onIncludeViolationChange } = renderFilterSwitchGroup()

    clickCheckboxByLabel(container, '只看原创作品')
    clickCheckboxByLabel(container, '包含潜在限制作品')

    expect(onOriginalOnlyChange).toHaveBeenCalledWith(true)
    expect(onIncludeViolationChange).toHaveBeenCalledWith(false)

    unmount()
  })
})
