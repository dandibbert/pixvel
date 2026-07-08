import type { SearchHistoryEntry, SearchParams } from '../types/search'
import { pickProperties } from '../utils/object'

export type SearchHistoryEntryKey = keyof Omit<SearchHistoryEntry, 'query' | 'timestamp'>

export const SEARCH_HISTORY_ENTRY_KEYS = [
  'sort',
  'searchTarget',
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
] satisfies ReadonlyArray<SearchHistoryEntryKey>

export function buildSearchHistoryState({
  searchHistory,
  entry,
  now = Date.now,
}: {
  searchHistory: SearchHistoryEntry[]
  entry: Omit<SearchHistoryEntry, 'timestamp'>
  now?: () => number
}) {
  return {
    searchHistory: addSearchHistoryEntry(searchHistory, entry, now()),
  }
}

export function buildClearedSearchHistoryState() {
  return {
    searchHistory: [],
  }
}

export function buildRemovedSearchHistoryState({
  searchHistory,
  index,
}: {
  searchHistory: ReadonlyArray<SearchHistoryEntry>
  index: number
}) {
  return {
    searchHistory: removeSearchHistoryEntry(searchHistory, index),
  }
}

export function createSearchHistoryEntry(
  searchParams: SearchParams,
): Omit<SearchHistoryEntry, 'timestamp'> {
  return {
    query: searchParams.query,
    ...pickSearchHistoryParams(searchParams),
    sort: searchParams.sort || 'date_desc',
    searchTarget: searchParams.searchTarget || 'partial_match_for_tags',
  }
}

export function addSearchHistoryEntry(
  searchHistory: SearchHistoryEntry[],
  entry: Omit<SearchHistoryEntry, 'timestamp'>,
  timestamp: number,
) {
  const nextEntry = { ...entry, timestamp }
  const filteredHistory = searchHistory.filter((item) => !isSameHistoryEntry(item, entry))

  return [nextEntry, ...filteredHistory].slice(0, 10)
}

export function removeSearchHistoryEntry(
  searchHistory: ReadonlyArray<SearchHistoryEntry>,
  indexToRemove: number,
) {
  return searchHistory.filter((_, index) => index !== indexToRemove)
}

function pickSearchHistoryParams(searchParams: SearchParams) {
  return pickProperties(searchParams, SEARCH_HISTORY_ENTRY_KEYS) as Pick<
    SearchHistoryEntry,
    SearchHistoryEntryKey
  >
}

function isSameHistoryEntry(
  item: SearchHistoryEntry,
  entry: Omit<SearchHistoryEntry, 'timestamp'>,
) {
  return item.query === entry.query &&
    SEARCH_HISTORY_ENTRY_KEYS.every((key) => item[key] === entry[key])
}
