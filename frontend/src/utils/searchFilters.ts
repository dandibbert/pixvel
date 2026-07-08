import type { SearchParams } from '../types/search'
import { hasOwnProperty, mapKeysToObject } from './object'

export type SearchTarget = NonNullable<SearchParams['searchTarget']>
export type SearchSort = NonNullable<SearchParams['sort']>
export type SearchLang = NonNullable<SearchParams['lang']>
export type SearchAiType = NonNullable<SearchParams['searchAiType']>

export interface SearchFilterValues {
  searchTarget: SearchTarget
  startDate: string
  endDate: string
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

export type SearchFilterValueSource = {
  searchTarget?: string
  startDate?: string
  endDate?: string
  bookmarkNum?: number
  bookmarkNumMin?: number
  bookmarkNumMax?: number
  textLengthMin?: number
  lang?: string
  includePotentialViolationWorks?: boolean
  includeTranslatedTagResults?: boolean
  isOriginalOnly?: boolean
  isReplaceableOnly?: boolean
  mergePlainKeywordResults?: boolean
  searchAiType?: string
}

export const DEFAULT_SEARCH_FILTER_VALUES: SearchFilterValues = {
  searchTarget: 'keyword',
  startDate: '',
  endDate: '',
  bookmarkNum: 0,
  bookmarkNumMin: 0,
  bookmarkNumMax: 0,
  textLengthMin: 0,
  lang: 'ja',
  includePotentialViolationWorks: false,
  includeTranslatedTagResults: true,
  isOriginalOnly: false,
  isReplaceableOnly: false,
  mergePlainKeywordResults: true,
  searchAiType: '1',
}

export const SEARCH_FILTER_VALUE_KEYS = Object.keys(
  DEFAULT_SEARCH_FILTER_VALUES,
) as Array<keyof SearchFilterValues>

const SEARCH_FILTER_CLEARABLE_OVERRIDE_KEYS: ReadonlyArray<keyof SearchFilterValues> = [
  'startDate',
  'endDate',
]

export function normalizeSearchTarget(searchTarget?: string): SearchTarget {
  if (
    searchTarget === 'partial_match_for_tags' ||
    searchTarget === 'exact_match_for_tags' ||
    searchTarget === 'text' ||
    searchTarget === 'keyword'
  ) {
    return searchTarget
  }

  return DEFAULT_SEARCH_FILTER_VALUES.searchTarget
}

export function resolveSearchTargetOverride({
  urlSearchTarget,
  cachedSearchTarget,
}: {
  urlSearchTarget?: string
  cachedSearchTarget?: string
}): SearchTarget {
  return normalizeSearchTarget(urlSearchTarget || cachedSearchTarget)
}

export function buildSearchFilterValues({
  source,
  searchTargetOverride,
}: {
  source: SearchFilterValueSource
  searchTargetOverride?: string
}): SearchFilterValues {
  const bookmarkNum = source.bookmarkNum || DEFAULT_SEARCH_FILTER_VALUES.bookmarkNum

  return {
    searchTarget: resolveSearchTargetOverride({
      urlSearchTarget: searchTargetOverride,
      cachedSearchTarget: source.searchTarget,
    }),
    startDate: source.startDate || DEFAULT_SEARCH_FILTER_VALUES.startDate,
    endDate: source.endDate || DEFAULT_SEARCH_FILTER_VALUES.endDate,
    bookmarkNum,
    bookmarkNumMin: source.bookmarkNumMin || bookmarkNum,
    bookmarkNumMax: source.bookmarkNumMax || DEFAULT_SEARCH_FILTER_VALUES.bookmarkNumMax,
    textLengthMin: source.textLengthMin || DEFAULT_SEARCH_FILTER_VALUES.textLengthMin,
    lang: normalizeSearchLang(source.lang),
    includePotentialViolationWorks:
      source.includePotentialViolationWorks ??
      DEFAULT_SEARCH_FILTER_VALUES.includePotentialViolationWorks,
    includeTranslatedTagResults:
      source.includeTranslatedTagResults ??
      DEFAULT_SEARCH_FILTER_VALUES.includeTranslatedTagResults,
    isOriginalOnly: source.isOriginalOnly ?? DEFAULT_SEARCH_FILTER_VALUES.isOriginalOnly,
    isReplaceableOnly: source.isReplaceableOnly ?? DEFAULT_SEARCH_FILTER_VALUES.isReplaceableOnly,
    mergePlainKeywordResults:
      source.mergePlainKeywordResults ?? DEFAULT_SEARCH_FILTER_VALUES.mergePlainKeywordResults,
    searchAiType: normalizeSearchAiType(source.searchAiType),
  }
}

export function areSearchFilterValuesEquivalent({
  source,
  values,
}: {
  source: SearchFilterValueSource
  values: SearchFilterValues
}) {
  const normalizedValues = buildSearchFilterValues({ source })

  return SEARCH_FILTER_VALUE_KEYS.every((key) => normalizedValues[key] === values[key])
}

export function mergeSearchFilterValueOverrides<T extends SearchFilterValueSource>(
  currentValues: T,
  overrides?: Partial<T>,
): T {
  if (!overrides) return currentValues

  const overrideSource = overrides as SearchFilterValueSource
  const mergedValues = mapKeysToObject(
    SEARCH_FILTER_VALUE_KEYS,
    (key) => {
      const overrideValue = overrideSource[key]
      const shouldApplyOverride =
        hasSearchFilterOverride(overrideSource, key) &&
        (overrideValue !== undefined || isClearableSearchFilterOverrideKey(key))

      return shouldApplyOverride
        ? overrideValue
        : currentValues[key]
    },
  )

  return {
    ...currentValues,
    ...mergedValues,
  }
}

export function normalizeSearchLang(lang?: string): SearchLang {
  return lang === 'zh-CN' ? 'zh-CN' : DEFAULT_SEARCH_FILTER_VALUES.lang
}

export function normalizeSearchAiType(searchAiType?: string): SearchAiType {
  return searchAiType === '0' ? '0' : DEFAULT_SEARCH_FILTER_VALUES.searchAiType
}

function isClearableSearchFilterOverrideKey(key: keyof SearchFilterValues) {
  return SEARCH_FILTER_CLEARABLE_OVERRIDE_KEYS.includes(key)
}

function hasSearchFilterOverride(
  overrides: SearchFilterValueSource,
  key: keyof SearchFilterValues,
) {
  return hasOwnProperty(overrides, key)
}
