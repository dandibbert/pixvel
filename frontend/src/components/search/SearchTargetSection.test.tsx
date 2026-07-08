import { describe, expect, it, vi } from 'vitest'
import { clickButtonByText, getButtonByText, renderReactElement } from '../../test/domTestUtils'
import SearchTargetSection from './SearchTargetSection'

describe('SearchTargetSection', () => {
  it('renders search target options and forwards target changes', () => {
    const onSearchTargetChange = vi.fn()
    const rendered = renderReactElement(
      <SearchTargetSection
        title="搜索范围"
        searchTarget="keyword"
        searchTargetLabel={(target) => `label:${target}`}
        onSearchTargetChange={onSearchTargetChange}
      />,
    )
    const { container } = rendered

    expect(container.textContent).toContain('搜索范围')
    expect(container.textContent).toContain('label:partial_match_for_tags')
    expect(container.textContent).toContain('label:exact_match_for_tags')
    expect(container.textContent).toContain('label:keyword')
    expect(container.textContent).toContain('label:text')
    expect(getButtonByText(container, 'label:keyword').className).toContain('bg-primary')

    clickButtonByText(container, 'label:text')

    expect(onSearchTargetChange).toHaveBeenCalledWith('text')

    rendered.unmount()
  })
})
