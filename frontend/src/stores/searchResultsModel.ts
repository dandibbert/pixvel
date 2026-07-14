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
  visibleResultCount: number
  isLoading: false
}

export type SearchResultsWithFiltersState = SearchResultsState & {
  filters: SearchFilters
}

export type ClearedSearchResultsState = Omit<SearchResultsState, 'isLoading'>

export const SEARCH_RESULT_BATCH_SIZE = 10

export function buildNextVisibleResultCount({
  current,
  total,
}: {
  current: number
  total: number
}) {
  return Math.min(current + SEARCH_RESULT_BATCH_SIZE, total)
}

export function buildSearchResultsState({
  result,
  existingResults = [],
}: {
  result: SearchApiResult
  existingResults?: Novel[]
}): SearchResultsState {
  const results = [...existingResults, ...result.novels]
  const visibleResultCount = existingResults.length > 0
    ? Math.min(existingResults.length + SEARCH_RESULT_BATCH_SIZE, results.length)
    : Math.min(SEARCH_RESULT_BATCH_SIZE, results.length)

  return {
    results,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    hasMore: result.page < result.totalPages,
    visibleResultCount,
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
    visibleResultCount: 0,
  }
}
