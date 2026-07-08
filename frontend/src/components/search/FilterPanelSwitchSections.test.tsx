import { describe, expect, it, vi } from 'vitest'
import { clickCheckboxByLabel, getCheckboxByLabel, renderReactElement } from '../../test/domTestUtils'

const { default: FilterPanelSwitchSections } = await import('./FilterPanelSwitchSections')

function renderFilterPanelSwitchSections() {
  const onIncludePotentialViolationWorksChange = vi.fn()
  const onIncludeTranslatedTagResultsChange = vi.fn()
  const onIsOriginalOnlyChange = vi.fn()
  const onIsReplaceableOnlyChange = vi.fn()
  const onMergePlainKeywordResultsChange = vi.fn()
  const onSearchAiTypeChange = vi.fn()

  return {
    ...renderReactElement(
      <FilterPanelSwitchSections
        contentTitle="内容筛选"
        matchingTitle="搜索增强"
        originalOnlyLabel="只看原创作品"
        excludeAiLabel="排除 AI 作品"
        includePotentialViolationLabel="包含潜在限制作品"
        includeTranslatedTagsLabel="包含翻译标签结果"
        mergePlainKeywordLabel="合并普通关键词结果"
        replaceableOnlyLabel="只看可替换作品"
        includePotentialViolationWorks={false}
        includeTranslatedTagResults={true}
        isOriginalOnly={false}
        isReplaceableOnly={false}
        mergePlainKeywordResults={true}
        searchAiType="1"
        onIncludePotentialViolationWorksChange={onIncludePotentialViolationWorksChange}
        onIncludeTranslatedTagResultsChange={onIncludeTranslatedTagResultsChange}
        onIsOriginalOnlyChange={onIsOriginalOnlyChange}
        onIsReplaceableOnlyChange={onIsReplaceableOnlyChange}
        onMergePlainKeywordResultsChange={onMergePlainKeywordResultsChange}
        onSearchAiTypeChange={onSearchAiTypeChange}
      />,
    ),
    onIncludePotentialViolationWorksChange,
    onIncludeTranslatedTagResultsChange,
    onIsOriginalOnlyChange,
    onIsReplaceableOnlyChange,
    onMergePlainKeywordResultsChange,
    onSearchAiTypeChange,
  }
}

describe('FilterPanelSwitchSections', () => {
  it('renders content and matching switch groups with controlled state', () => {
    const { container, unmount } = renderFilterPanelSwitchSections()

    expect(container.textContent).toContain('内容筛选')
    expect(container.textContent).toContain('搜索增强')
    expect(getCheckboxByLabel(container, '只看原创作品').checked).toBe(false)
    expect(getCheckboxByLabel(container, '排除 AI 作品').checked).toBe(true)
    expect(getCheckboxByLabel(container, '包含翻译标签结果').checked).toBe(true)
    expect(getCheckboxByLabel(container, '只看可替换作品').checked).toBe(false)

    unmount()
  })

  it('forwards switch changes to the matching filter handlers', () => {
    const {
      container,
      unmount,
      onIncludePotentialViolationWorksChange,
      onIncludeTranslatedTagResultsChange,
      onIsOriginalOnlyChange,
      onIsReplaceableOnlyChange,
      onMergePlainKeywordResultsChange,
      onSearchAiTypeChange,
    } = renderFilterPanelSwitchSections()

    clickCheckboxByLabel(container, '只看原创作品')
    clickCheckboxByLabel(container, '排除 AI 作品')
    clickCheckboxByLabel(container, '包含潜在限制作品')
    clickCheckboxByLabel(container, '包含翻译标签结果')
    clickCheckboxByLabel(container, '合并普通关键词结果')
    clickCheckboxByLabel(container, '只看可替换作品')

    expect(onIsOriginalOnlyChange).toHaveBeenCalledWith(true)
    expect(onSearchAiTypeChange).toHaveBeenCalledWith('0')
    expect(onIncludePotentialViolationWorksChange).toHaveBeenCalledWith(true)
    expect(onIncludeTranslatedTagResultsChange).toHaveBeenCalledWith(false)
    expect(onMergePlainKeywordResultsChange).toHaveBeenCalledWith(false)
    expect(onIsReplaceableOnlyChange).toHaveBeenCalledWith(true)

    unmount()
  })
})
