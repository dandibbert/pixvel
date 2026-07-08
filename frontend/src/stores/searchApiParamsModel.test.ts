import { describe, expect, it } from 'vitest'
import {
  buildSearchApiParams,
  includeDefinedApiParam,
  includePositiveApiParam,
  includeTruthyApiParam,
  SEARCH_API_PARAM_FIELDS,
} from './searchApiParamsModel'

describe('searchApiParamsModel', () => {
  it('groups optional search filters by API inclusion policy', () => {
    expect(SEARCH_API_PARAM_FIELDS).toEqual({
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
    })
  })

  it('includes API params according to each field policy', () => {
    expect(includeTruthyApiParam({}, 'start_date', undefined)).toEqual({})
    expect(includeTruthyApiParam({}, 'start_date', '')).toEqual({})
    expect(includeTruthyApiParam({}, 'start_date', '2025-04-26')).toEqual({
      start_date: '2025-04-26',
    })

    expect(includePositiveApiParam({}, 'bookmark_num', undefined)).toEqual({})
    expect(includePositiveApiParam({}, 'bookmark_num', 0)).toEqual({})
    expect(includePositiveApiParam({}, 'bookmark_num', -1)).toEqual({})
    expect(includePositiveApiParam({}, 'bookmark_num', 100)).toEqual({
      bookmark_num: 100,
    })

    expect(includeDefinedApiParam({}, 'include_translated_tag_results', undefined)).toEqual({})
    expect(includeDefinedApiParam({}, 'include_translated_tag_results', false)).toEqual({
      include_translated_tag_results: false,
    })
    expect(includeDefinedApiParam({}, 'include_translated_tag_results', true)).toEqual({
      include_translated_tag_results: true,
    })
  })

  it('maps store search filters to backend API parameter names', () => {
    expect(
      buildSearchApiParams({
        query: '五悠',
        page: 2,
        sort: 'popular_desc',
        searchTarget: 'keyword',
        startDate: '2025-04-26',
        endDate: '2026-04-26',
        bookmarkNum: 100,
        bookmarkNumMin: 1000,
        bookmarkNumMax: 4999,
        textLengthMin: 3000,
        lang: 'ja',
        includePotentialViolationWorks: false,
        includeTranslatedTagResults: true,
        isOriginalOnly: false,
        isReplaceableOnly: false,
        mergePlainKeywordResults: true,
        searchAiType: '1',
      }),
    ).toEqual({
      word: '五悠',
      page: 2,
      sort: 'popular_desc',
      search_target: 'keyword',
      start_date: '2025-04-26',
      end_date: '2026-04-26',
      bookmark_num: 100,
      bookmark_num_min: 1000,
      bookmark_num_max: 4999,
      text_length_min: 3000,
      lang: 'ja',
      include_potential_violation_works: false,
      include_translated_tag_results: true,
      is_original_only: false,
      is_replaceable_only: false,
      merge_plain_keyword_results: true,
      search_ai_type: '1',
    })
  })

  it('omits empty optional API params and keeps the legacy default search target', () => {
    expect(
      buildSearchApiParams({
        query: '五悠',
        page: 1,
        bookmarkNum: 0,
        bookmarkNumMin: 0,
        textLengthMin: 0,
      }),
    ).toEqual({
      word: '五悠',
      page: 1,
      sort: undefined,
      search_target: 'partial_match_for_tags',
    })
  })
})
