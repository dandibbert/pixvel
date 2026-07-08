import { describe, expect, it } from 'vitest'
import type { SearchParams } from '../types/search'
import {
  buildSearchLoadMoreApiParams,
  buildSearchRequest,
} from './searchRequestModel'

const baseFilters: Omit<SearchParams, 'query'> = {
  page: 1,
  limit: 20,
  sort: 'date_desc',
  searchTarget: 'keyword',
  startDate: '2025-04-26',
  bookmarkNumMin: 1000,
}

describe('searchRequestModel', () => {
  it('builds a complete first-page search request with history and synced filters', () => {
    expect(
      buildSearchRequest({
        query: 'cached',
        limit: 20,
        filters: {
          page: 7,
          limit: 20,
          sort: 'popular_desc',
          searchTarget: 'text',
          startDate: '2025-04-26',
        },
        params: {
          query: '五悠',
          page: 1,
          sort: 'date_desc',
          searchTarget: 'keyword',
          startDate: undefined,
          bookmarkNumMin: 1000,
        },
      }),
    ).toEqual({
      searchParams: {
        query: '五悠',
        page: 1,
        limit: 20,
        sort: 'date_desc',
        tags: undefined,
        authorId: undefined,
        searchTarget: 'keyword',
        startDate: undefined,
        endDate: undefined,
        bookmarkNum: undefined,
        bookmarkNumMin: 1000,
        bookmarkNumMax: undefined,
        textLengthMin: undefined,
        lang: undefined,
        includePotentialViolationWorks: undefined,
        includeTranslatedTagResults: undefined,
        isOriginalOnly: undefined,
        isReplaceableOnly: undefined,
        mergePlainKeywordResults: undefined,
        searchAiType: undefined,
      },
      apiParams: {
        word: '五悠',
        page: 1,
        sort: 'date_desc',
        search_target: 'keyword',
        bookmark_num_min: 1000,
      },
      historyEntry: {
        query: '五悠',
        sort: 'date_desc',
        searchTarget: 'keyword',
        startDate: undefined,
        endDate: undefined,
        bookmarkNum: undefined,
        bookmarkNumMin: 1000,
        bookmarkNumMax: undefined,
        textLengthMin: undefined,
        lang: undefined,
        includePotentialViolationWorks: undefined,
        includeTranslatedTagResults: undefined,
        isOriginalOnly: undefined,
        isReplaceableOnly: undefined,
        mergePlainKeywordResults: undefined,
        searchAiType: undefined,
      },
      syncedFilters: {
        page: 1,
        limit: 20,
        sort: 'date_desc',
        searchTarget: 'keyword',
        startDate: undefined,
        endDate: undefined,
        bookmarkNum: undefined,
        bookmarkNumMin: 1000,
        bookmarkNumMax: undefined,
        textLengthMin: undefined,
        lang: undefined,
        includePotentialViolationWorks: undefined,
        includeTranslatedTagResults: undefined,
        isOriginalOnly: undefined,
        isReplaceableOnly: undefined,
        mergePlainKeywordResults: undefined,
        searchAiType: undefined,
      },
    })
  })

  it('omits history entries for follow-up pages', () => {
    expect(
      buildSearchRequest({
        query: '五悠',
        limit: 20,
        filters: baseFilters,
        params: {
          page: 2,
        },
      }).historyEntry,
    ).toBeNull()
  })

  it('builds load-more API params from the current query, filters, and next page', () => {
    expect(
      buildSearchLoadMoreApiParams({
        query: '五悠',
        filters: {
          page: 1,
          limit: 20,
          sort: 'popular_desc',
          searchTarget: 'keyword',
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
        },
        nextPage: 2,
      }),
    ).toEqual({
      word: '五悠',
      page: 2,
      sort: 'popular_desc',
      search_target: 'keyword',
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
})
