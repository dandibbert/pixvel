import type { Novel, SearchHistoryEntry } from '../types/search'
import { getErrorMessage } from '../utils/errorLog'
import type { SearchFilters } from './searchFiltersModel'

export type SearchPersistSnapshot = {
  searchHistory: SearchHistoryEntry[]
  query: string
  filters: SearchFilters
  results: Novel[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

export function buildSearchLoadingState() {
  return {
    isLoading: true,
    error: null,
  }
}

export function buildSearchErrorState(error: unknown, fallbackMessage: string) {
  return {
    error: getErrorMessage(error, fallbackMessage),
    isLoading: false,
  }
}

export function buildSearchClearErrorState() {
  return {
    error: null,
  }
}

export function buildSearchQueryState(query: string) {
  return {
    query,
  }
}

export function buildSearchPageState(page: number) {
  return {
    page,
  }
}

export function buildSearchPersistSnapshot<State extends SearchPersistSnapshot>(
  state: State,
): SearchPersistSnapshot {
  return {
    searchHistory: state.searchHistory,
    query: state.query,
    filters: state.filters,
    results: state.results,
    total: state.total,
    page: state.page,
    totalPages: state.totalPages,
    hasMore: state.hasMore,
  }
}
