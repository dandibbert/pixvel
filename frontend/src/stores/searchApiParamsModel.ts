import type { SearchParams } from '../types/search'

export type SearchApiParams = Record<string, string | number | boolean | undefined>

type TruthySearchApiParamKey = 'startDate' | 'endDate' | 'lang' | 'searchAiType'
type PositiveSearchApiParamKey =
  | 'bookmarkNum'
  | 'bookmarkNumMin'
  | 'bookmarkNumMax'
  | 'textLengthMin'
type DefinedSearchApiParamKey =
  | 'includePotentialViolationWorks'
  | 'includeTranslatedTagResults'
  | 'isOriginalOnly'
  | 'isReplaceableOnly'
  | 'mergePlainKeywordResults'
type SearchApiParamField<Key extends keyof SearchParams> = readonly [Key, string]

export const SEARCH_API_PARAM_FIELDS = {
  truthy: [
    ['startDate', 'start_date'],
    ['endDate', 'end_date'],
    ['lang', 'lang'],
    ['searchAiType', 'search_ai_type'],
  ],
  positive: [
    ['bookmarkNum', 'bookmark_num'],
    ['bookmarkNumMin', 'bookmark_num_min'],
    ['bookmarkNumMax', 'bookmark_num_max'],
    ['textLengthMin', 'text_length_min'],
  ],
  defined: [
    ['includePotentialViolationWorks', 'include_potential_violation_works'],
    ['includeTranslatedTagResults', 'include_translated_tag_results'],
    ['isOriginalOnly', 'is_original_only'],
    ['isReplaceableOnly', 'is_replaceable_only'],
    ['mergePlainKeywordResults', 'merge_plain_keyword_results'],
  ],
} satisfies {
  truthy: ReadonlyArray<SearchApiParamField<TruthySearchApiParamKey>>
  positive: ReadonlyArray<SearchApiParamField<PositiveSearchApiParamKey>>
  defined: ReadonlyArray<SearchApiParamField<DefinedSearchApiParamKey>>
}

export function buildSearchApiParams(searchParams: SearchParams): SearchApiParams {
  const apiParams: SearchApiParams = {
    word: searchParams.query,
    page: searchParams.page,
    sort: searchParams.sort,
    search_target: searchParams.searchTarget || 'partial_match_for_tags',
  }

  for (const [paramKey, apiKey] of SEARCH_API_PARAM_FIELDS.truthy) {
    includeTruthyApiParam(apiParams, apiKey, searchParams[paramKey])
  }

  for (const [paramKey, apiKey] of SEARCH_API_PARAM_FIELDS.positive) {
    includePositiveApiParam(apiParams, apiKey, searchParams[paramKey])
  }

  for (const [paramKey, apiKey] of SEARCH_API_PARAM_FIELDS.defined) {
    includeDefinedApiParam(apiParams, apiKey, searchParams[paramKey])
  }

  return apiParams
}

export function includeTruthyApiParam(
  apiParams: SearchApiParams,
  key: string,
  value: string | undefined,
) {
  if (value) {
    apiParams[key] = value
  }

  return apiParams
}

export function includeDefinedApiParam(
  apiParams: SearchApiParams,
  key: string,
  value: string | number | boolean | undefined,
) {
  if (value !== undefined) {
    apiParams[key] = value
  }

  return apiParams
}

export function includePositiveApiParam(
  apiParams: SearchApiParams,
  key: string,
  value: number | undefined,
) {
  if (value !== undefined && value > 0) {
    apiParams[key] = value
  }

  return apiParams
}
