import type { SearchParams } from '../types/search'
import { hasOwnProperty, mapKeysToObject, pickProperties } from '../utils/object'
import {
  SEARCH_HISTORY_ENTRY_KEYS,
  type SearchHistoryEntryKey,
} from './searchHistoryModel'

export type SearchFilters = Omit<SearchParams, 'query'>

type SyncedSearchFilterKey = 'page' | SearchHistoryEntryKey
type OptionalSearchFilterKey = Exclude<
  keyof SearchFilters,
  'page' | 'limit' | 'sort' | 'searchTarget'
>

export const SEARCH_SYNCED_FILTER_KEYS = [
  'page',
  ...SEARCH_HISTORY_ENTRY_KEYS,
] satisfies ReadonlyArray<SyncedSearchFilterKey>

export const SEARCH_OPTIONAL_FILTER_KEYS = [
  'tags',
  'authorId',
  'startDate',
  'endDate',
  'bookmarkNum',
  'bookmarkNumMin',
  'bookmarkNumMax',
  'textLengthMin',
  'lang',
  'includePotentialViolationWorks',
  'includeTranslatedTagResults',
  'isOriginalOnly',
  'isReplaceableOnly',
  'mergePlainKeywordResults',
  'searchAiType',
] satisfies ReadonlyArray<OptionalSearchFilterKey>

export function buildSearchFiltersState({
  currentFilters,
  filters,
}: {
  currentFilters: SearchFilters
  filters: Partial<SearchParams>
}) {
  return {
    filters: {
      ...currentFilters,
      ...filters,
    },
  }
}

export function resolveSearchParams({
  query,
  limit,
  filters,
  params,
}: {
  query: string
  limit: number
  filters: Omit<SearchParams, 'query'>
  params?: Partial<SearchParams>
}): SearchParams {
  return {
    query: params?.query ?? query,
    page: params?.page ?? 1,
    limit: params?.limit ?? limit,
    sort: params?.sort ?? filters.sort,
    searchTarget: params?.searchTarget ?? filters.searchTarget,
    ...resolveOptionalSearchParams({
      params,
      filters,
      keys: SEARCH_OPTIONAL_FILTER_KEYS,
    }),
  }
}

export function resolveOptionalSearchParam<Key extends keyof SearchFilters>({
  params,
  filters,
  key,
}: {
  params?: Partial<SearchParams>
  filters: Pick<SearchFilters, Key>
  key: Key
}): SearchFilters[Key] | undefined {
  return hasSearchParam(params, key) ? params?.[key] : filters[key]
}

export function resolveOptionalSearchParams<Key extends keyof SearchFilters>({
  params,
  filters,
  keys,
}: {
  params?: Partial<SearchParams>
  filters: Pick<SearchFilters, Key>
  keys: ReadonlyArray<Key>
}): Pick<SearchFilters, Key> {
  return mapKeysToObject(
    keys,
    (key) => resolveOptionalSearchParam({ params, filters, key }),
  ) as Pick<SearchFilters, Key>
}

export function buildSyncedSearchFilters({
  currentFilters,
  searchParams,
}: {
  currentFilters: SearchFilters
  searchParams: SearchParams
}): SearchFilters {
  return {
    ...currentFilters,
    ...pickSearchParams(searchParams, SEARCH_SYNCED_FILTER_KEYS),
  }
}

function hasSearchParam(params: Partial<SearchParams> | undefined, name: keyof SearchParams) {
  return params !== undefined && hasOwnProperty(params, name)
}

function pickSearchParams<Key extends keyof SearchFilters>(
  searchParams: SearchParams,
  keys: ReadonlyArray<Key>,
): Pick<SearchFilters, Key> {
  return pickProperties(searchParams, keys) as Pick<SearchFilters, Key>
}
