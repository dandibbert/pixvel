import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SearchParams, SearchResult, Novel, SearchHistoryEntry } from '../types/search'
import { api } from '../utils/api'

interface SearchState {
  query: string
  filters: Omit<SearchParams, 'query'>
  results: Novel[]
  total: number
  page: number
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
            return (
              item.query !== entry.query ||
              item.searchTarget !== entry.searchTarget ||
              item.sort !== entry.sort ||
              item.startDate !== entry.startDate ||
              item.endDate !== entry.endDate ||
              item.bookmarkNum !== entry.bookmarkNum
            )
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
          tags: params?.tags ?? state.filters.tags,
          authorId: params?.authorId ?? state.filters.authorId,
          searchTarget: params?.searchTarget ?? state.filters.searchTarget,
          startDate: params?.startDate ?? state.filters.startDate,
          endDate: params?.endDate ?? state.filters.endDate,
          bookmarkNum: params?.bookmarkNum ?? state.filters.bookmarkNum,
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
          })
        }

        try {
          set({ isLoading: true, error: null })

          // Build API params matching backend expectations
          const apiParams: Record<string, any> = {
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

          const result = await api.get<{
            novels: Novel[]
            total: number
            page: number
            totalPages: number
          }>('/novels/search', apiParams)

          set({
            results: result.novels,
            total: result.total,
            page: result.page,
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
          const result = await api.get<SearchResult>('/novels/search', {
            query: state.query,
            page: nextPage,
            limit: state.limit,
            ...state.filters,
          })

          set({
            results: [...state.results, ...result.novels],
            page: result.page,
            hasMore: result.hasMore,
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
        hasMore: state.hasMore,
      }),
    }
  )
)
