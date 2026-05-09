import { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  const container = document.createElement('div')
  document.body.appendChild(container)

  const root = createRoot(container)
  const onApply = vi.fn()

  act(() => {
    root.render(
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
    )
  })

  return { container, root, onApply }
}

function getButton(container: HTMLElement, text: string) {
  const button = Array.from(container.querySelectorAll('button')).find((element) => element.textContent?.includes(text))

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`Button containing text "${text}" was not found`)
  }

  return button
}

function unmount(root: Root, container: HTMLElement) {
  act(() => root.unmount())
  container.remove()
}

describe('FilterPanel', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('opens overlay drawer and closes when clicking outside', () => {
    const { container, root } = renderFilterPanel()

    act(() => {
      getButton(container, '筛选器').click()
    })

    expect(container.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('筛选器')
    expect(container.textContent).toContain('关键词')
    expect(container.textContent).toContain('不限制')
    expect(container.textContent).toContain('排除 AI 作品')

    const overlay = container.querySelector('[data-testid="filter-overlay"]')
    if (!(overlay instanceof HTMLElement)) {
      throw new Error('Filter overlay was not found')
    }

    act(() => {
      overlay.click()
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()

    unmount(root, container)
  })

  it('uses a mobile-safe scroll container for the overlay drawer', () => {
    const { container, root } = renderFilterPanel()

    act(() => {
      getButton(container, '筛选器').click()
    })

    const overlay = container.querySelector('[data-testid="filter-overlay"]')
    const dialog = container.querySelector('[role="dialog"]')

    if (!(overlay instanceof HTMLElement) || !(dialog instanceof HTMLElement)) {
      throw new Error('Filter overlay dialog was not found')
    }

    expect(overlay.className).toContain('overflow-y-auto')
    expect(overlay.className).toContain('overscroll-contain')
    expect(dialog.className).toContain('max-h-[calc(100dvh-1rem)]')
    expect(dialog.className).toContain('overflow-y-auto')
    expect(dialog.className).toContain('overscroll-contain')
    expect(dialog.className).toContain('touch-pan-y')
    expect(dialog.className).toContain('[-webkit-overflow-scrolling:touch]')
    expect(dialog.contains(getButton(container, '应用筛选'))).toBe(true)
    expect(dialog.contains(getButton(container, '重置'))).toBe(true)

    unmount(root, container)
  })

  it('shows validation errors and does not apply invalid ranges', () => {
    const { container, root, onApply } = renderFilterPanel({
      startDate: '2026-04-26',
      endDate: '2025-04-26',
      bookmarkNumMin: 5000,
      bookmarkNumMax: 1000,
    })

    act(() => {
      getButton(container, '筛选器').click()
    })

    act(() => {
      getButton(container, '应用筛选').click()
    })

    expect(container.textContent).toContain('开始日期不能晚于结束日期')
    expect(container.textContent).toContain('收藏下限不能高于收藏上限')
    expect(onApply).not.toHaveBeenCalled()

    unmount(root, container)
  })
})
