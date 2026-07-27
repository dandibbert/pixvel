import type { Novel, NovelKeywordMatchResult, SearchHistoryEntry, SearchParams } from '../types/search'
import { evaluateNovelKeywordMatch } from '../utils/keywordFilter'
import { mapItemsToObject } from '../utils/object'
import {
  areSearchFilterValuesEquivalent,
  buildSearchFilterValues,
  mergeSearchFilterValueOverrides,
  normalizeSearchAiType,
  normalizeSearchLang,
  normalizeSearchTarget,
  resolveSearchTargetOverride,
  type SearchAiType,
  type SearchLang,
  type SearchSort,
  type SearchTarget,
} from '../utils/searchFilters'

export {
  normalizeSearchAiType,
  normalizeSearchLang,
  normalizeSearchTarget,
  resolveSearchTargetOverride,
}

export type {
  SearchAiType,
  SearchLang,
  SearchSort,
  SearchTarget,
}

export type NovelMatchMap = Readonly<Record<string, NovelKeywordMatchResult>>

export interface SearchFilterState {
  searchTarget: SearchTarget
  startDate?: string
  endDate?: string
  bookmarkNum: number
  bookmarkNumMin: number
  bookmarkNumMax: number
  textLengthMin: number
  lang: SearchLang
  includePotentialViolationWorks: boolean
  includeTranslatedTagResults: boolean
  isOriginalOnly: boolean
  isReplaceableOnly: boolean
  mergePlainKeywordResults: boolean
  searchAiType: SearchAiType
}

export type SearchFilterOverrides = Partial<SearchFilterState>

interface InitialSearchUrlState {
  q: string
  page: number
  sort: string
  target: string
}

export const MAX_SEARCH_QUERY_LENGTH = 100

export function buildSearchDocumentTitle({
  query,
  prefix,
  defaultTitle,
}: {
  query: string | undefined
  prefix: string
  defaultTitle: string
}) {
  const searchQuery = query?.trim()

  return searchQuery
    ? `${prefix}「${searchQuery}」- Pixvel`
    : defaultTitle
}

export function buildKeywordMatchMap(
  novels: ReadonlyArray<Novel>,
  blockedWords: ReadonlyArray<string>,
  highlightWords: ReadonlyArray<string>,
): NovelMatchMap {
  return mapItemsToObject(
    novels,
    (novel) => [
      novel.id,
      evaluateNovelKeywordMatch(novel, blockedWords, highlightWords),
    ],
  )
}

export function buildDisplayKeywordMatchMap(
  keywordMatchMap: NovelMatchMap,
  revealedBlockedIds: ReadonlySet<string>,
): NovelMatchMap {
  return mapItemsToObject(
    Object.entries(keywordMatchMap),
    ([novelId, match]) => {
      const isBlocked = match.isBlocked && !revealedBlockedIds.has(novelId)
      // Preserve reference when unchanged so memoized cards skip re-rendering
      return [novelId, isBlocked === match.isBlocked ? match : { ...match, isBlocked }]
    },
  )
}

export function resolveSelectedNovelKeywordMatch(
  keywordMatchMap: NovelMatchMap,
  selectedNovel: Pick<Novel, 'id'> | null | undefined,
) {
  return selectedNovel ? keywordMatchMap[selectedNovel.id] : undefined
}

export function createFilterStateFromCachedFilters(
  cachedFilters: Omit<SearchParams, 'query'>,
  urlSearchTarget?: string,
): SearchFilterState {
  return buildSearchFilterValues({
    source: cachedFilters,
    searchTargetOverride: urlSearchTarget,
  })
}

export function createFilterStateFromHistoryEntry(
  entry: SearchHistoryEntry,
): SearchFilterState {
  return buildSearchFilterValues({ source: entry })
}

export function resolveInitialSearchHydration({
  urlState,
  currentFilters,
  cachedFilters,
  cachedQuery,
  cachedPage,
  resultCount,
}: {
  urlState: InitialSearchUrlState
  currentFilters: SearchFilterState
  cachedFilters: Omit<SearchParams, 'query'>
  cachedQuery: string
  cachedPage: number
  resultCount: number
}) {
  if (!urlState.q) return null

  const searchTarget = resolveSearchTargetOverride({
    urlSearchTarget: urlState.target,
    cachedSearchTarget: cachedFilters.searchTarget,
  })
  const filters = {
    ...currentFilters,
    searchTarget,
  }
  const isCachedQuery =
    cachedQuery === urlState.q &&
    cachedPage === urlState.page &&
    cachedFilters.sort === urlState.sort &&
    areSearchFiltersEquivalent(cachedFilters, filters) &&
    resultCount > 0

  return {
    query: urlState.q,
    filters,
    shouldSearch: !isCachedQuery,
    search: {
      query: urlState.q,
      page: urlState.page,
      sort: urlState.sort as SearchSort,
      filters,
    },
  }
}

export function resolveSearchFilterState(
  currentFilters: SearchFilterState,
  overrides?: SearchFilterOverrides,
): SearchFilterState {
  return mergeSearchFilterValueOverrides(currentFilters, overrides)
}

export function buildSearchStoreParams({
  query,
  page,
  sort,
  filters,
}: {
  query: string
  page: number
  sort: SearchSort
  filters: SearchFilterState
}): SearchParams {
  return {
    query,
    page,
    sort,
    searchTarget: filters.searchTarget,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    bookmarkNum: filters.bookmarkNum > 0 ? filters.bookmarkNum : undefined,
    bookmarkNumMin: filters.bookmarkNumMin > 0 ? filters.bookmarkNumMin : undefined,
    bookmarkNumMax: filters.bookmarkNumMax > 0 ? filters.bookmarkNumMax : undefined,
    textLengthMin: filters.textLengthMin > 0 ? filters.textLengthMin : undefined,
    lang: filters.lang,
    includePotentialViolationWorks: filters.includePotentialViolationWorks,
    includeTranslatedTagResults: filters.includeTranslatedTagResults,
    isOriginalOnly: filters.isOriginalOnly,
    isReplaceableOnly: filters.isReplaceableOnly,
    mergePlainKeywordResults: filters.mergePlainKeywordResults,
    searchAiType: filters.searchAiType,
  }
}

export function resolveSearchExecution({
  currentQuery,
  currentPage,
  currentSort,
  currentFilters,
  searchQuery,
  searchPage,
  searchSort,
  filterOverrides,
}: {
  currentQuery: string
  currentPage: number
  currentSort: SearchSort
  currentFilters: SearchFilterState
  searchQuery?: string
  searchPage?: number
  searchSort?: SearchSort
  filterOverrides?: SearchFilterOverrides
}) {
  const query = searchQuery !== undefined ? searchQuery : currentQuery
  const page = searchPage !== undefined ? searchPage : currentPage
  const sort = searchSort !== undefined ? searchSort : currentSort
  const filters = resolveSearchFilterState(currentFilters, filterOverrides)

  if (!query.trim() || query.length > MAX_SEARCH_QUERY_LENGTH) {
    return null
  }

  return {
    query,
    page,
    sort,
    filters,
    urlState: {
      q: query,
      page,
      sort,
      target: filters.searchTarget,
    },
    storeParams: buildSearchStoreParams({
      query,
      page,
      sort,
      filters,
    }),
  }
}

export function areSearchFiltersEquivalent(
  cachedFilters: Omit<SearchParams, 'query'>,
  filters: SearchFilterState,
) {
  return areSearchFilterValuesEquivalent({
    source: cachedFilters,
    values: {
      ...filters,
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
    },
  })
}
