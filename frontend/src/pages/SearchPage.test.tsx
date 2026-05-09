import { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SearchKeywordRulesProvider } from '../contexts/SearchKeywordRulesContext'
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
    isLoading: false,
    error: null,
    searchHistory: [],
  })
}

function renderSearchPage(path = '/search') {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const root = createRoot(container)

  act(() => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <SearchKeywordRulesProvider>
          <SearchPage />
        </SearchKeywordRulesProvider>
      </MemoryRouter>,
    )
  })

  return { container, root }
}

function unmount(root: Root, container: HTMLElement) {
  act(() => root.unmount())
  container.remove()
}

function getButton(container: HTMLElement, text: string) {
  const button = Array.from(container.querySelectorAll('button')).find((element) => element.textContent?.includes(text))

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`Button containing text "${text}" was not found`)
  }

  return button
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
    })

    const { container, root } = renderSearchPage('/search?q=五悠&page=1&sort=date_desc&target=keyword')

    expect(container.textContent).toContain('/ 2')
    expect(container.textContent).not.toContain('/ 3')

    unmount(root, container)
  })

  it('rejects direct URL search terms over the backend length limit before searching', async () => {
    const rendered: { root: Root; container: HTMLElement }[] = []
    const longQuery = '五'.repeat(101)

    await act(async () => {
      rendered.push(renderSearchPage(`/search?q=${longQuery}&page=1&sort=date_desc&target=keyword`))
      await Promise.resolve()
    })

    expect(mockedGet).not.toHaveBeenCalled()
    expect(useSearchStore.getState().searchHistory).toHaveLength(0)

    if (rendered[0]) {
      unmount(rendered[0].root, rendered[0].container)
    }
  })

  it('normalizes invalid URL search target before searching', async () => {
    const rendered: { root: Root; container: HTMLElement }[] = []

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
      unmount(rendered[0].root, rendered[0].container)
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

    const { container, root } = renderSearchPage('/search?q=五悠&page=1&sort=date_desc&target=keyword')

    act(() => {
      getButton(container, '筛选器').click()
    })

    const dialog = container.querySelector('[role="dialog"]')
    if (!(dialog instanceof HTMLElement)) {
      throw new Error('Filter dialog was not found')
    }

    const dateInputs = Array.from(dialog.querySelectorAll('input[type="date"]')) as HTMLInputElement[]
    const numberInputs = Array.from(dialog.querySelectorAll('input[type="number"]')) as HTMLInputElement[]
    const languageSelect = dialog.querySelector('select')
    const switches = Array.from(dialog.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[]

    expect(dateInputs.map((input) => input.value)).toEqual(['2025-04-26', '2026-04-26'])
    expect(numberInputs.map((input) => input.value)).toEqual(['1000', '4999', '3000'])
    expect(languageSelect).toBeInstanceOf(HTMLSelectElement)
    expect((languageSelect as HTMLSelectElement).value).toBe('zh-CN')
    expect(switches.map((input) => input.checked)).toEqual([true, false, true, false, false, true])

    unmount(root, container)
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

    const { container, root } = renderSearchPage('/search?q=五悠&page=1&sort=date_desc&target=keyword')

    act(() => {
      getButton(container, '筛选器').click()
    })

    const dateInputs = Array.from(container.querySelectorAll('input[type="date"]')) as HTMLInputElement[]
    expect(dateInputs.map((input) => input.value)).toEqual(['2025-04-26', '2026-04-26'])

    act(() => {
      for (const input of dateInputs) {
        input.value = ''
        input.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    await act(async () => {
      getButton(container, '应用筛选').click()
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

    unmount(root, container)
  })
})
