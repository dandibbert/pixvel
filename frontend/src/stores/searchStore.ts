import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SearchParams, Novel, SearchHistoryEntry } from '../types/search'
import { api } from '../utils/api'
import { buildSearchFiltersState } from './searchFiltersModel'
import {
  buildClearedSearchResultsState,
  buildSearchResultsState,
  buildSearchResultsWithFiltersState,
  type SearchApiResult,
} from './searchResultsModel'
import {
  buildClearedSearchHistoryState,
  buildRemovedSearchHistoryState,
  buildSearchHistoryState,
} from './searchHistoryModel'
import {
  buildSearchClearErrorState,
  buildSearchErrorState,
  buildSearchLoadingState,
  buildSearchPageState,
  buildSearchPersistSnapshot,
  buildSearchQueryState,
  type SearchPersistSnapshot,
} from './searchStoreModel'
import {
  buildSearchLoadMoreApiParams,
  buildSearchRequest,
} from './searchRequestModel'

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

export const useSearchStore = create<SearchState>()(
  persist<SearchState, [], [], SearchPersistSnapshot>(
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
          return buildSearchHistoryState({
            searchHistory: state.searchHistory,
            entry,
          })
        })
      },

      clearHistory: () => set(buildClearedSearchHistoryState()),

      removeFromHistory: (index) =>
        set((state) =>
          buildRemovedSearchHistoryState({
            searchHistory: state.searchHistory,
            index,
          })
        ),

      setQuery: (query) => set(buildSearchQueryState(query)),

      setFilters: (filters) =>
        set((state) =>
          buildSearchFiltersState({
            currentFilters: state.filters,
            filters,
          })
        ),

      search: async (params) => {
        const state = get()
        const request = buildSearchRequest({
          query: state.query,
          limit: state.limit,
          filters: state.filters,
          params,
        })

        if (request.historyEntry) {
          state.addToHistory(request.historyEntry)
        }

        try {
          set(buildSearchLoadingState())

          const result = await api.get<SearchApiResult>('/novels/search', request.apiParams)

          set(buildSearchResultsWithFiltersState({
            result,
            filters: request.syncedFilters,
          }))
        } catch (error) {
          set(buildSearchErrorState(error, 'Search failed'))
        }
      },

      loadMore: async () => {
        const state = get()
        if (!state.hasMore || state.isLoading) return

        const nextPage = state.page + 1
        try {
          set(buildSearchLoadingState())
          const result = await api.get<SearchApiResult>(
            '/novels/search',
            buildSearchLoadMoreApiParams({
              query: state.query,
              filters: state.filters,
              nextPage,
            }),
          )

          set(buildSearchResultsState({ result, existingResults: state.results }))
        } catch (error) {
          set(buildSearchErrorState(error, 'Load more failed'))
        }
      },

      setPage: (page) => set(buildSearchPageState(page)),

      clearResults: () => set(buildClearedSearchResultsState()),

      clearError: () => set(buildSearchClearErrorState()),
    }),
    {
      name: 'search-cache-storage',
      partialize: buildSearchPersistSnapshot,
    }
  )
)
