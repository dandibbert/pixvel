import type { SearchHistoryEntry, SearchParams } from '../types/search'
import {
  buildSearchApiParams,
  type SearchApiParams,
} from './searchApiParamsModel'
import {
  buildSyncedSearchFilters,
  resolveSearchParams,
  type SearchFilters,
} from './searchFiltersModel'
import { createSearchHistoryEntry } from './searchHistoryModel'

export type SearchRequest = {
  searchParams: SearchParams
  apiParams: SearchApiParams
  historyEntry: Omit<SearchHistoryEntry, 'timestamp'> | null
  syncedFilters: SearchFilters
}

export function buildSearchRequest({
  query,
  limit,
  filters,
  params,
}: {
  query: string
  limit: number
  filters: SearchFilters
  params?: Partial<SearchParams>
}): SearchRequest {
  const searchParams = resolveSearchParams({
    query,
    limit,
    filters,
    params,
  })

  return {
    searchParams,
    apiParams: buildSearchApiParams(searchParams),
    historyEntry: searchParams.query && searchParams.page === 1
      ? createSearchHistoryEntry(searchParams)
      : null,
    syncedFilters: buildSyncedSearchFilters({
      currentFilters: filters,
      searchParams,
    }),
  }
}

export function buildSearchLoadMoreApiParams({
  query,
  filters,
  nextPage,
}: {
  query: string
  filters: SearchFilters
  nextPage: number
}): SearchApiParams {
  return buildSearchApiParams({
    query,
    ...filters,
    page: nextPage,
  })
}
