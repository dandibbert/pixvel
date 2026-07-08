import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clickButtonContainingText,
  clickElement,
  getButtonContainingText,
  getElementBySelector,
  renderReactElement,
} from '../../test/domTestUtils'
import FilterPanel from './FilterPanel'

const translations: Record<string, string> = {
  'filter.title': '筛选器',
  'filter.searchMode': '搜索范围',
  'filter.publishDateRange': '发布时间范围',
  'filter.noLimit': '不限制',
  'filter.bookmarkMin': '收藏下限',
  'filter.bookmarkMax': '收藏上限',
  'filter.textLengthMin': '字数下限',
  'filter.lang': '返回语言',
  'filter.content': '内容筛选',
  'filter.matching': '搜索增强',
  'filter.originalOnly': '只看原创作品',
  'filter.excludeAi': '排除 AI 作品',
  'filter.includePotentialViolation': '包含潜在限制作品',
  'filter.includeTranslatedTags': '包含翻译标签结果',
  'filter.mergePlainKeyword': '合并普通关键词结果',
  'filter.replaceableOnly': '只看可替换作品',
  'filter.reset': '重置',
  'filter.apply': '应用筛选',
  'filter.close': '关闭筛选器',
  'filter.dateStart': '开始日期',
  'filter.dateEnd': '结束日期',
  'filter.dateRangeInvalid': '开始日期不能晚于结束日期',
  'filter.bookmarkRangeInvalid': '收藏下限不能高于收藏上限',
  'search.target.partial_match_for_tags': '标签(部分)',
  'search.target.exact_match_for_tags': '标签(完全)',
  'search.target.text': '正文',
  'search.target.keyword': '关键词',
}

vi.mock('../../i18n/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => translations[key] ?? key,
    searchTargetLabel: (target: string) => translations[`search.target.${target}`] ?? target,
  }),
}))

function renderFilterPanel(props: Partial<React.ComponentProps<typeof FilterPanel>> = {}) {
  const onApply = vi.fn()

  return {
    ...renderReactElement(
      <FilterPanel
        searchTarget="keyword"
        startDate=""
        endDate=""
        bookmarkNum={0}
        bookmarkNumMin={0}
        bookmarkNumMax={0}
        textLengthMin={0}
        lang="ja"
        includePotentialViolationWorks={false}
        includeTranslatedTagResults={true}
        isOriginalOnly={false}
        isReplaceableOnly={false}
        mergePlainKeywordResults={true}
        searchAiType="1"
        onSearchTargetChange={vi.fn()}
        onStartDateChange={vi.fn()}
        onEndDateChange={vi.fn()}
        onBookmarkNumChange={vi.fn()}
        onBookmarkNumMinChange={vi.fn()}
        onBookmarkNumMaxChange={vi.fn()}
        onTextLengthMinChange={vi.fn()}
        onLangChange={vi.fn()}
        onIncludePotentialViolationWorksChange={vi.fn()}
        onIncludeTranslatedTagResultsChange={vi.fn()}
        onIsOriginalOnlyChange={vi.fn()}
        onIsReplaceableOnlyChange={vi.fn()}
        onMergePlainKeywordResultsChange={vi.fn()}
        onSearchAiTypeChange={vi.fn()}
        onApply={onApply}
        {...props}
      />,
    ),
    onApply,
  }
}

describe('FilterPanel', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('opens overlay drawer and closes when clicking outside', () => {
    const { container, unmount } = renderFilterPanel()

    clickButtonContainingText(container, '筛选器')

    expect(container.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('筛选器')
    expect(container.textContent).toContain('关键词')
    expect(container.textContent).toContain('不限制')
    expect(container.textContent).toContain('排除 AI 作品')

    const overlay = getElementBySelector(container, '[data-testid="filter-overlay"]', HTMLElement, 'Filter overlay')

    clickElement(overlay)

    expect(container.querySelector('[role="dialog"]')).toBeNull()

    unmount()
  })

  it('uses a mobile-safe scroll container for the overlay drawer', () => {
    const { container, unmount } = renderFilterPanel()

    clickButtonContainingText(container, '筛选器')

    const overlay = getElementBySelector(container, '[data-testid="filter-overlay"]', HTMLElement, 'Filter overlay')
    const dialog = getElementBySelector(container, '[role="dialog"]', HTMLElement, 'Filter dialog')

    expect(overlay.className).toContain('overflow-y-auto')
    expect(overlay.className).toContain('overscroll-contain')
    expect(dialog.className).toContain('max-h-[calc(100dvh-1rem)]')
    expect(dialog.className).toContain('overflow-y-auto')
    expect(dialog.className).toContain('overscroll-contain')
    expect(dialog.className).toContain('touch-pan-y')
    expect(dialog.className).toContain('[-webkit-overflow-scrolling:touch]')
    expect(dialog.contains(getButtonContainingText(container, '应用筛选'))).toBe(true)
    expect(dialog.contains(getButtonContainingText(container, '重置'))).toBe(true)

    unmount()
  })

  it('shows validation errors and does not apply invalid ranges', () => {
    const { container, unmount, onApply } = renderFilterPanel({
      startDate: '2026-04-26',
      endDate: '2025-04-26',
      bookmarkNumMin: 5000,
      bookmarkNumMax: 1000,
    })

    clickButtonContainingText(container, '筛选器')

    clickButtonContainingText(container, '应用筛选')

    expect(container.textContent).toContain('开始日期不能晚于结束日期')
    expect(container.textContent).toContain('收藏下限不能高于收藏上限')
    expect(onApply).not.toHaveBeenCalled()

    unmount()
  })
})
