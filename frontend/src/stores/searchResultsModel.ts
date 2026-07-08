import type { Novel } from '../types/search'
import type { SearchFilters } from './searchFiltersModel'

export type SearchApiResult = {
  novels: Novel[]
  total: number
  page: number
  totalPages: number
}

export type SearchResultsState = {
  results: Novel[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
  isLoading: false
}

export type SearchResultsWithFiltersState = SearchResultsState & {
  filters: SearchFilters
}

export type ClearedSearchResultsState = Omit<SearchResultsState, 'isLoading'>

export function buildSearchResultsState({
  result,
  existingResults = [],
}: {
  result: SearchApiResult
  existingResults?: Novel[]
}): SearchResultsState {
  return {
    results: [...existingResults, ...result.novels],
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    hasMore: result.page < result.totalPages,
    isLoading: false,
  }
}

export function buildSearchResultsWithFiltersState({
  result,
  filters,
}: {
  result: SearchApiResult
  filters: SearchFilters
}): SearchResultsWithFiltersState {
  return {
    ...buildSearchResultsState({ result }),
    filters,
  }
}

export function buildClearedSearchResultsState(): ClearedSearchResultsState {
  return {
    results: [],
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false,
  }
}
