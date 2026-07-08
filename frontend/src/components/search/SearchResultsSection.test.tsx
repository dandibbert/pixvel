import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clickButtonContainingText,
  renderReactElement,
} from '../../test/domTestUtils'
import type { Novel, NovelKeywordMatchResult } from '../../types/search'
import SearchResultsSection from './SearchResultsSection'

const translations: Record<string, string> = {
  'search.loading': '搜索中',
  'search.resultsFoundPrefix': '找到',
  'search.resultsFoundSuffix': '个结果',
  'search.emptyNoResults': '没有结果',
  'search.emptyStartSearch': '开始搜索',
}

vi.mock('../../i18n/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => translations[key] ?? key,
    formatNumber: (value: number) => value.toLocaleString('zh-CN'),
  }),
}))

vi.mock('../novel/NovelGrid', () => ({
  default: ({
    novels,
    onNovelClick,
    onRevealBlocked,
  }: {
    novels: Novel[]
    onNovelClick: (novel: Novel) => void
    onRevealBlocked?: (novelId: string) => void
    keywordMatchMap?: Readonly<Record<string, NovelKeywordMatchResult>>
  }) => (
    <div data-testid="novel-grid">
      {novels.map((novel) => (
        <div key={novel.id}>
          <button type="button" onClick={() => onNovelClick(novel)}>
            open {novel.title}
          </button>
          <button type="button" onClick={() => onRevealBlocked?.(novel.id)}>
            reveal {novel.id}
          </button>
        </div>
      ))}
    </div>
  ),
}))

vi.mock('../common/Pagination', () => ({
  default: ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }) => (
    <button type="button" onClick={() => onPageChange(currentPage + 1)}>
      page {currentPage} / {totalPages}
    </button>
  ),
}))

function createNovel(id: string): Novel {
  return {
    id,
    title: `Novel ${id}`,
    description: '',
    author: {
      id: `author-${id}`,
      name: 'Author',
    },
    tags: [],
    pageCount: 1,
    textLength: 1000,
    totalBookmarks: 0,
    totalViews: 0,
    createdAt: '2026-04-26T00:00:00.000Z',
    updatedAt: '2026-04-26T00:00:00.000Z',
  }
}

function renderSearchResultsSection(
  props: Partial<React.ComponentProps<typeof SearchResultsSection>> = {},
) {
  const onNovelClick = vi.fn()
  const onRevealBlocked = vi.fn()
  const onPageChange = vi.fn()

  return {
    ...renderReactElement(
      <SearchResultsSection
        isLoading={false}
        results={[]}
        total={0}
        totalPages={1}
        currentPage={1}
        hasSearchQuery={false}
        keywordMatchMap={{}}
        onNovelClick={onNovelClick}
        onRevealBlocked={onRevealBlocked}
        onPageChange={onPageChange}
        {...props}
      />,
    ),
    onNovelClick,
    onRevealBlocked,
    onPageChange,
  }
}

describe('SearchResultsSection', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders the loading state before any results', () => {
    const { container, unmount } = renderSearchResultsSection({ isLoading: true })

    expect(container.textContent).toContain('搜索中')
    expect(container.querySelector('[data-testid="novel-grid"]')).toBeNull()

    unmount()
  })

  it('renders result totals, grid, pagination, and forwards interactions', () => {
    const novel = createNovel('first')
    const { container, unmount, onNovelClick, onRevealBlocked, onPageChange } =
      renderSearchResultsSection({
        results: [novel],
        total: 1200,
        totalPages: 3,
        currentPage: 2,
      })

    expect(container.textContent).toContain('找到 1,200 个结果')
    expect(container.querySelector('[data-testid="novel-grid"]')).toBeInstanceOf(HTMLElement)

    clickButtonContainingText(container, 'open Novel first')
    clickButtonContainingText(container, 'reveal first')
    clickButtonContainingText(container, 'page 2 / 3')

    expect(onNovelClick).toHaveBeenCalledWith(novel)
    expect(onRevealBlocked).toHaveBeenCalledWith('first')
    expect(onPageChange).toHaveBeenCalledWith(3)

    unmount()
  })

  it('hides pagination for single-page results', () => {
    const { container, unmount } = renderSearchResultsSection({
      results: [createNovel('first')],
      totalPages: 1,
    })

    expect(container.textContent).not.toContain('page 1 / 1')

    unmount()
  })

  it('renders the searched empty state and initial empty state', () => {
    const searched = renderSearchResultsSection({ hasSearchQuery: true })
    expect(searched.container.textContent).toContain('没有结果')
    searched.unmount()

    const initial = renderSearchResultsSection({ hasSearchQuery: false })
    expect(initial.container.textContent).toContain('开始搜索')
    initial.unmount()
  })
})
