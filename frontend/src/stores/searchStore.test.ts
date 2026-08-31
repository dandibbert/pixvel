import { beforeEach, expect, test, vi } from 'vitest'

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

const { useSearchStore } = await import('./searchStore')
const { api } = await import('../utils/api')

vi.mock('../utils/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

const mockedGet = vi.mocked(api.get)

function createNovel(id: string) {
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

beforeEach(() => {
  mockedGet.mockReset()
  mockedGet.mockResolvedValue({
    novels: [],
    total: 0,
    page: 1,
    totalPages: 1,
  })

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
})

test('search forwards new Pixiv App API filters', async () => {
  await useSearchStore.getState().search({
    query: '五悠',
    page: 1,
    sort: 'date_desc',
    searchTarget: 'keyword',
    startDate: '2025-04-26',
    endDate: '2026-04-26',
    bookmarkNumMin: 1000,
    bookmarkNumMax: 4999,
    textLengthMin: 3000,
    lang: 'ja',
    includePotentialViolationWorks: false,
    includeTranslatedTagResults: true,
    isOriginalOnly: false,
    isReplaceableOnly: false,
    mergePlainKeywordResults: true,
    searchAiType: '1',
  })

  expect(mockedGet).toHaveBeenCalledWith('/novels/search', {
    word: '五悠',
    page: 1,
    sort: 'date_desc',
    search_target: 'keyword',
    start_date: '2025-04-26',
    end_date: '2026-04-26',
    bookmark_num_min: 1000,
    bookmark_num_max: 4999,
    text_length_min: 3000,
    lang: 'ja',
    include_potential_violation_works: false,
    include_translated_tag_results: true,
    is_original_only: false,
    is_replaceable_only: false,
    merge_plain_keyword_results: true,
    search_ai_type: '1',
  })
  expect(useSearchStore.getState().totalPages).toBe(1)
})

test('search history keeps entries with different new filters', () => {
  const store = useSearchStore.getState()

  store.addToHistory({
    query: '五悠',
    sort: 'date_desc',
    searchTarget: 'keyword',
    bookmarkNumMin: 1000,
  })
  store.addToHistory({
    query: '五悠',
    sort: 'date_desc',
    searchTarget: 'keyword',
    bookmarkNumMin: 2000,
  })

  expect(useSearchStore.getState().searchHistory).toHaveLength(2)
})

test('search treats explicitly undefined filters as cleared values', async () => {
  useSearchStore.setState({
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
    },
  })

  await useSearchStore.getState().search({
    query: '五悠',
    page: 1,
    sort: 'date_desc',
    searchTarget: 'keyword',
    startDate: undefined,
    endDate: undefined,
    bookmarkNumMin: undefined,
    bookmarkNumMax: undefined,
    textLengthMin: undefined,
  })

  expect(mockedGet).toHaveBeenCalledWith('/novels/search', {
    word: '五悠',
    page: 1,
    sort: 'date_desc',
    search_target: 'keyword',
  })
})

test('loadMore uses backend API parameter names and current filters', async () => {
  mockedGet.mockResolvedValueOnce({
    novels: [createNovel('next')],
    total: 30,
    page: 2,
    totalPages: 2,
  })

  useSearchStore.setState({
    query: '五悠',
    filters: {
      page: 1,
      limit: 20,
      sort: 'popular_desc',
      searchTarget: 'keyword',
      bookmarkNumMin: 1000,
      bookmarkNumMax: 4999,
      textLengthMin: 3000,
      lang: 'ja',
      includePotentialViolationWorks: false,
      includeTranslatedTagResults: true,
      isOriginalOnly: false,
      isReplaceableOnly: false,
      mergePlainKeywordResults: true,
      searchAiType: '1',
    },
    results: [createNovel('first')],
    page: 1,
    hasMore: true,
  })

  await useSearchStore.getState().loadMore()

  expect(mockedGet).toHaveBeenCalledWith('/novels/search', {
    word: '五悠',
    page: 2,
    sort: 'popular_desc',
    search_target: 'keyword',
    bookmark_num_min: 1000,
    bookmark_num_max: 4999,
    text_length_min: 3000,
    lang: 'ja',
    include_potential_violation_works: false,
    include_translated_tag_results: true,
    is_original_only: false,
    is_replaceable_only: false,
    merge_plain_keyword_results: true,
    search_ai_type: '1',
  })
  expect(useSearchStore.getState().totalPages).toBe(2)
})

test('clearResults resets backend pagination state', () => {
  useSearchStore.setState({
    results: [createNovel('first')],
    total: 3000,
    page: 99,
    totalPages: 100,
    hasMore: true,
  })

  useSearchStore.getState().clearResults()

  expect(useSearchStore.getState().totalPages).toBe(1)
})
