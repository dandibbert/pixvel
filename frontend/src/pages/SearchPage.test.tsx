import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SearchKeywordRulesProvider } from '../contexts/SearchKeywordRulesContext'
import {
  changeInputValue,
  clickButtonContainingText,
  getButtonContainingText,
  getElementBySelector,
  getElementsBySelector,
  renderReactElement,
} from '../test/domTestUtils'
import { Novel } from '../types/search'

vi.mock('../utils/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

const memoryStorage = new Map<string, string>()

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => memoryStorage.get(key) ?? null,
    setItem: (key: string, value: string) => memoryStorage.set(key, value),
    removeItem: (key: string) => memoryStorage.delete(key),
    clear: () => memoryStorage.clear(),
  },
  configurable: true,
})

const { default: SearchPage } = await import('./SearchPage')
const { useSearchStore } = await import('../stores/searchStore')
const { api } = await import('../utils/api')

const mockedGet = vi.mocked(api.get)

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

function resetSearchStore() {
  useSearchStore.setState({
    query: '',
    filters: {
      page: 1,
      limit: 20,
      sort: 'date_desc',
    },
    results: [],
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 20,
    hasMore: false,
    visibleResultCount: 0,
    isLoading: false,
    error: null,
    searchHistory: [],
  })
}

function renderSearchPage(path = '/search') {
  return renderReactElement(
    <MemoryRouter initialEntries={[path]}>
      <SearchKeywordRulesProvider>
        <SearchPage />
      </SearchKeywordRulesProvider>
    </MemoryRouter>,
  )
}

describe('SearchPage', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    mockedGet.mockReset()
    mockedGet.mockResolvedValue({
      novels: [],
      total: 0,
      page: 1,
      totalPages: 1,
    })
    resetSearchStore()
  })

  it('uses backend totalPages from the search store', () => {
    useSearchStore.setState({
      query: '五悠',
      filters: {
        page: 1,
        limit: 20,
        sort: 'date_desc',
        searchTarget: 'keyword',
      },
      results: [createNovel('first')],
      total: 60,
      page: 1,
      totalPages: 2,
      hasMore: true,
      visibleResultCount: 1,
    })

    const { container, unmount } = renderSearchPage('/search?q=五悠&page=1&sort=date_desc&target=keyword')

    expect(container.textContent).toContain('/ 2')
    expect(container.textContent).not.toContain('/ 3')

    unmount()
  })

  it('reveals cached backend-page results through the persisted ten-item action', () => {
    const results = Array.from({ length: 12 }, (_, index) => createNovel(String(index + 1)))

    useSearchStore.setState({
      query: '五悠',
      filters: {
        page: 1,
        limit: 20,
        sort: 'date_desc',
        searchTarget: 'keyword',
      },
      results,
      total: 12,
      page: 1,
      totalPages: 1,
      hasMore: false,
      visibleResultCount: 10,
    })

    const { container, unmount } = renderSearchPage('/search?q=五悠&page=1&sort=date_desc&target=keyword')

    expect(container.textContent).not.toContain('Novel 11')
    clickButtonContainingText(container, '继续加载 2 篇')
    expect(container.textContent).toContain('Novel 11')

    unmount()
  })

  it('uses a transparent content-first card on mobile and restores the desktop card at md', () => {
    const { container, unmount } = renderSearchPage()
    const contentCard = getElementBySelector(
      container,
      '[data-testid="search-content-card"]',
      HTMLElement,
      'Search content card',
    )

    expect(contentCard.className).toContain('bg-transparent')
    expect(contentCard.className).toContain('md:bg-white')
    expect(contentCard.className).toContain('shadow-none')
    expect(contentCard.className).toContain('md:shadow-xl')

    unmount()
  })

  it('rejects direct URL search terms over the backend length limit before searching', async () => {
    const rendered: ReturnType<typeof renderSearchPage>[] = []
    const longQuery = '五'.repeat(101)

    await act(async () => {
      rendered.push(renderSearchPage(`/search?q=${longQuery}&page=1&sort=date_desc&target=keyword`))
      await Promise.resolve()
    })

    expect(mockedGet).not.toHaveBeenCalled()
    expect(useSearchStore.getState().searchHistory).toHaveLength(0)

    if (rendered[0]) {
      rendered[0].unmount()
    }
  })

  it('normalizes invalid URL search target before searching', async () => {
    const rendered: ReturnType<typeof renderSearchPage>[] = []

    await act(async () => {
      rendered.push(renderSearchPage('/search?q=五悠&page=1&sort=date_desc&target=bad_target'))
      await Promise.resolve()
    })

    expect(mockedGet).toHaveBeenCalledWith('/novels/search', {
      word: '五悠',
      page: 1,
      sort: 'date_desc',
      search_target: 'keyword',
      lang: 'ja',
      include_potential_violation_works: false,
      include_translated_tag_results: true,
      is_original_only: false,
      is_replaceable_only: false,
      merge_plain_keyword_results: true,
      search_ai_type: '1',
    })

    if (rendered[0]) {
      rendered[0].unmount()
    }
  })

  it('hydrates filter drawer values from persisted search filters', () => {
    useSearchStore.setState({
      query: '五悠',
      filters: {
        page: 1,
        limit: 20,
        sort: 'date_desc',
        searchTarget: 'keyword',
        startDate: '2025-04-26',
        endDate: '2026-04-26',
        bookmarkNumMin: 1000,
        bookmarkNumMax: 4999,
        textLengthMin: 3000,
        lang: 'zh-CN',
        includePotentialViolationWorks: true,
        includeTranslatedTagResults: false,
        isOriginalOnly: true,
        isReplaceableOnly: true,
        mergePlainKeywordResults: false,
        searchAiType: '0',
      },
      results: [createNovel('first')],
      total: 30,
      page: 1,
      totalPages: 1,
      hasMore: false,
    })

    const { container, unmount } = renderSearchPage('/search?q=五悠&page=1&sort=date_desc&target=keyword')

    clickButtonContainingText(container, '筛选器')

    const dialog = getElementBySelector(container, '[role="dialog"]', HTMLElement, 'Filter dialog')

    const dateInputs = getElementsBySelector(dialog, 'input[type="date"]', HTMLInputElement, 'Date inputs')
    const directDateInputs = getElementsBySelector(
      dialog,
      'input[data-direct-date-input]',
      HTMLInputElement,
      'Direct date inputs',
    )
    const bookmarkInputs = getElementsBySelector(
      dialog,
      'input[data-bookmark-input]',
      HTMLInputElement,
      'Bookmark inputs',
    )
    const numberInputs = getElementsBySelector(dialog, 'input[type="number"]', HTMLInputElement, 'Number inputs')
    const languageSelect = getElementBySelector(dialog, 'select', HTMLSelectElement, 'Language select')
    const switches = getElementsBySelector(dialog, 'input[type="checkbox"]', HTMLInputElement, 'Switch inputs')

    expect(dateInputs.map((input) => input.value)).toEqual(['2025-04-26', '2026-04-26'])
    expect(directDateInputs.map((input) => input.value)).toEqual(['2025/04/26', '2026/04/26'])
    expect(bookmarkInputs.map((input) => input.value)).toEqual(['1000', '4999'])
    expect(numberInputs.map((input) => input.value)).toEqual(['3000'])
    expect(languageSelect.value).toBe('zh-CN')
    expect(switches.map((input) => input.checked)).toEqual([true, false, true, false, false, true])

    unmount()
  })

  it('clears persisted date filters when the native date picker reset emits input events', async () => {
    useSearchStore.setState({
      query: '五悠',
      filters: {
        page: 1,
        limit: 20,
        sort: 'date_desc',
        searchTarget: 'keyword',
        startDate: '2025-04-26',
        endDate: '2026-04-26',
      },
      results: [createNovel('first')],
      total: 30,
      page: 1,
      totalPages: 1,
      hasMore: false,
    })

    const { container, unmount } = renderSearchPage('/search?q=五悠&page=1&sort=date_desc&target=keyword')

    clickButtonContainingText(container, '筛选器')

    const dateInputs = getElementsBySelector(container, 'input[type="date"]', HTMLInputElement, 'Date inputs')
    expect(dateInputs.map((input) => input.value)).toEqual(['2025-04-26', '2026-04-26'])

    for (const input of dateInputs) {
      changeInputValue(input, '')
    }

    await act(async () => {
      getButtonContainingText(container, '应用筛选').click()
      await Promise.resolve()
    })

    expect(mockedGet).toHaveBeenCalledWith('/novels/search', {
      word: '五悠',
      page: 1,
      sort: 'date_desc',
      search_target: 'keyword',
      lang: 'ja',
      include_potential_violation_works: false,
      include_translated_tag_results: true,
      is_original_only: false,
      is_replaceable_only: false,
      merge_plain_keyword_results: true,
      search_ai_type: '1',
    })
    expect(useSearchStore.getState().filters.startDate).toBeUndefined()
    expect(useSearchStore.getState().filters.endDate).toBeUndefined()

    unmount()
  })
})
