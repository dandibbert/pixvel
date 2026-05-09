import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SearchParams, Novel, SearchHistoryEntry } from '../types/search'
import { api } from '../utils/api'

interface SearchState {
  query: string
  filters: Omit<SearchParams, 'query'>
  results: Novel[]
  total: number
  page: number
  totalPages: number
  limit: number
  hasMore: boolean
  isLoading: boolean
  error: string | null

  searchHistory: SearchHistoryEntry[]
  addToHistory: (entry: Omit<SearchHistoryEntry, 'timestamp'>) => void
  clearHistory: () => void
  removeFromHistory: (index: number) => void

  setQuery: (query: string) => void
  setFilters: (filters: Partial<SearchParams>) => void
  search: (params?: Partial<SearchParams>) => Promise<void>
  loadMore: () => Promise<void>
  setPage: (page: number) => void
  clearResults: () => void
  clearError: () => void
}

type SearchApiParams = Record<string, string | number | boolean | undefined>
type SearchApiResult = {
  novels: Novel[]
  total: number
  page: number
  totalPages: number
}

function buildSearchApiParams(searchParams: SearchParams): SearchApiParams {
  const apiParams: SearchApiParams = {
    word: searchParams.query,
    page: searchParams.page,
    sort: searchParams.sort,
    search_target: searchParams.searchTarget || 'partial_match_for_tags',
  }

  if (searchParams.startDate) apiParams.start_date = searchParams.startDate
  if (searchParams.endDate) apiParams.end_date = searchParams.endDate
  if (searchParams.bookmarkNum && searchParams.bookmarkNum > 0) {
    apiParams.bookmark_num = searchParams.bookmarkNum
  }
  if (searchParams.bookmarkNumMin && searchParams.bookmarkNumMin > 0) {
    apiParams.bookmark_num_min = searchParams.bookmarkNumMin
  }
  if (searchParams.bookmarkNumMax && searchParams.bookmarkNumMax > 0) {
    apiParams.bookmark_num_max = searchParams.bookmarkNumMax
  }
  if (searchParams.textLengthMin && searchParams.textLengthMin > 0) {
    apiParams.text_length_min = searchParams.textLengthMin
  }
  if (searchParams.lang) apiParams.lang = searchParams.lang
  if (searchParams.includePotentialViolationWorks !== undefined) {
    apiParams.include_potential_violation_works = searchParams.includePotentialViolationWorks
  }
  if (searchParams.includeTranslatedTagResults !== undefined) {
    apiParams.include_translated_tag_results = searchParams.includeTranslatedTagResults
  }
  if (searchParams.isOriginalOnly !== undefined) {
    apiParams.is_original_only = searchParams.isOriginalOnly
  }
  if (searchParams.isReplaceableOnly !== undefined) {
    apiParams.is_replaceable_only = searchParams.isReplaceableOnly
  }
  if (searchParams.mergePlainKeywordResults !== undefined) {
    apiParams.merge_plain_keyword_results = searchParams.mergePlainKeywordResults
  }
  if (searchParams.searchAiType) apiParams.search_ai_type = searchParams.searchAiType

  return apiParams
}

function hasSearchParam(params: Partial<SearchParams> | undefined, name: keyof SearchParams) {
  return params !== undefined && Object.prototype.hasOwnProperty.call(params, name)
}

function isSameHistoryEntry(
  item: SearchHistoryEntry,
  entry: Omit<SearchHistoryEntry, 'timestamp'>,
) {
  return (
    item.query === entry.query &&
    item.searchTarget === entry.searchTarget &&
    item.sort === entry.sort &&
    item.startDate === entry.startDate &&
    item.endDate === entry.endDate &&
    item.bookmarkNum === entry.bookmarkNum &&
    item.bookmarkNumMin === entry.bookmarkNumMin &&
    item.bookmarkNumMax === entry.bookmarkNumMax &&
    item.textLengthMin === entry.textLengthMin &&
    item.lang === entry.lang &&
    item.includePotentialViolationWorks === entry.includePotentialViolationWorks &&
    item.includeTranslatedTagResults === entry.includeTranslatedTagResults &&
    item.isOriginalOnly === entry.isOriginalOnly &&
    item.isReplaceableOnly === entry.isReplaceableOnly &&
    item.mergePlainKeywordResults === entry.mergePlainKeywordResults &&
    item.searchAiType === entry.searchAiType
  )
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
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

      addToHistory: (entry) => {
        set((state) => {
          const newEntry = { ...entry, timestamp: Date.now() }
          // Remove duplicates
          const filteredHistory = state.searchHistory.filter((item) => {
            return !isSameHistoryEntry(item, entry)
          })

          return {
            searchHistory: [newEntry, ...filteredHistory].slice(0, 10),
          }
        })
      },

      clearHistory: () => set({ searchHistory: [] }),

      removeFromHistory: (index) =>
        set((state) => ({
          searchHistory: state.searchHistory.filter((_, i) => i !== index),
        })),

      setQuery: (query) => set({ query }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      search: async (params) => {
        const state = get()
        const searchParams: SearchParams = {
          query: params?.query ?? state.query,
          page: params?.page ?? 1,
          limit: params?.limit ?? state.limit,
          sort: params?.sort ?? state.filters.sort,
          tags: hasSearchParam(params, 'tags') ? params?.tags : state.filters.tags,
          authorId: hasSearchParam(params, 'authorId') ? params?.authorId : state.filters.authorId,
          searchTarget: params?.searchTarget ?? state.filters.searchTarget,
          startDate: hasSearchParam(params, 'startDate') ? params?.startDate : state.filters.startDate,
          endDate: hasSearchParam(params, 'endDate') ? params?.endDate : state.filters.endDate,
          bookmarkNum: hasSearchParam(params, 'bookmarkNum') ? params?.bookmarkNum : state.filters.bookmarkNum,
          bookmarkNumMin: hasSearchParam(params, 'bookmarkNumMin') ? params?.bookmarkNumMin : state.filters.bookmarkNumMin,
          bookmarkNumMax: hasSearchParam(params, 'bookmarkNumMax') ? params?.bookmarkNumMax : state.filters.bookmarkNumMax,
          textLengthMin: hasSearchParam(params, 'textLengthMin') ? params?.textLengthMin : state.filters.textLengthMin,
          lang: hasSearchParam(params, 'lang') ? params?.lang : state.filters.lang,
          includePotentialViolationWorks: hasSearchParam(params, 'includePotentialViolationWorks')
            ? params?.includePotentialViolationWorks
            : state.filters.includePotentialViolationWorks,
          includeTranslatedTagResults: hasSearchParam(params, 'includeTranslatedTagResults')
            ? params?.includeTranslatedTagResults
            : state.filters.includeTranslatedTagResults,
          isOriginalOnly: hasSearchParam(params, 'isOriginalOnly')
            ? params?.isOriginalOnly
            : state.filters.isOriginalOnly,
          isReplaceableOnly: hasSearchParam(params, 'isReplaceableOnly')
            ? params?.isReplaceableOnly
            : state.filters.isReplaceableOnly,
          mergePlainKeywordResults: hasSearchParam(params, 'mergePlainKeywordResults')
            ? params?.mergePlainKeywordResults
            : state.filters.mergePlainKeywordResults,
          searchAiType: hasSearchParam(params, 'searchAiType') ? params?.searchAiType : state.filters.searchAiType,
        }

        // Add to history if query is present and it's a fresh search (page 1)
        if (searchParams.query && searchParams.page === 1) {
          state.addToHistory({
            query: searchParams.query,
            sort: searchParams.sort || 'date_desc',
            searchTarget: searchParams.searchTarget || 'partial_match_for_tags',
            startDate: searchParams.startDate,
            endDate: searchParams.endDate,
            bookmarkNum: searchParams.bookmarkNum,
            bookmarkNumMin: searchParams.bookmarkNumMin,
            bookmarkNumMax: searchParams.bookmarkNumMax,
            textLengthMin: searchParams.textLengthMin,
            lang: searchParams.lang,
            includePotentialViolationWorks: searchParams.includePotentialViolationWorks,
            includeTranslatedTagResults: searchParams.includeTranslatedTagResults,
            isOriginalOnly: searchParams.isOriginalOnly,
            isReplaceableOnly: searchParams.isReplaceableOnly,
            mergePlainKeywordResults: searchParams.mergePlainKeywordResults,
            searchAiType: searchParams.searchAiType,
          })
        }

        try {
          set({ isLoading: true, error: null })

          const result = await api.get<SearchApiResult>('/novels/search', buildSearchApiParams(searchParams))

          set({
            results: result.novels,
            total: result.total,
            page: result.page,
            totalPages: result.totalPages,
            hasMore: result.page < result.totalPages,
            isLoading: false,
            filters: {
              ...state.filters,
              page: searchParams.page,
              sort: searchParams.sort,
              searchTarget: searchParams.searchTarget,
              startDate: searchParams.startDate,
              endDate: searchParams.endDate,
              bookmarkNum: searchParams.bookmarkNum,
              bookmarkNumMin: searchParams.bookmarkNumMin,
              bookmarkNumMax: searchParams.bookmarkNumMax,
              textLengthMin: searchParams.textLengthMin,
              lang: searchParams.lang,
              includePotentialViolationWorks: searchParams.includePotentialViolationWorks,
              includeTranslatedTagResults: searchParams.includeTranslatedTagResults,
              isOriginalOnly: searchParams.isOriginalOnly,
              isReplaceableOnly: searchParams.isReplaceableOnly,
              mergePlainKeywordResults: searchParams.mergePlainKeywordResults,
              searchAiType: searchParams.searchAiType,
            },
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Search failed',
            isLoading: false,
          })
        }
      },

      loadMore: async () => {
        const state = get()
        if (!state.hasMore || state.isLoading) return

        const nextPage = state.page + 1
        try {
          set({ isLoading: true, error: null })
          const result = await api.get<SearchApiResult>(
            '/novels/search',
            buildSearchApiParams({
              query: state.query,
              ...state.filters,
              page: nextPage,
            }),
          )

          set({
            results: [...state.results, ...result.novels],
            total: result.total,
            page: result.page,
            totalPages: result.totalPages,
            hasMore: result.page < result.totalPages,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Load more failed',
            isLoading: false,
          })
        }
      },

      setPage: (page) => set({ page }),

      clearResults: () =>
        set({
          results: [],
          total: 0,
          page: 1,
          totalPages: 1,
          hasMore: false,
        }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'search-cache-storage',
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        query: state.query,
        filters: state.filters,
        results: state.results,
        total: state.total,
        page: state.page,
        totalPages: state.totalPages,
        hasMore: state.hasMore,
      }),
    }
  )
)
