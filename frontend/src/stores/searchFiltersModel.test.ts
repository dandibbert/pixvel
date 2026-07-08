import { describe, expect, it } from 'vitest'
import type { SearchParams } from '../types/search'
import {
  buildSearchFiltersState,
  buildSyncedSearchFilters,
  resolveOptionalSearchParam,
  resolveSearchParams,
  SEARCH_OPTIONAL_FILTER_KEYS,
  SEARCH_SYNCED_FILTER_KEYS,
} from './searchFiltersModel'

const baseFilters: Omit<SearchParams, 'query'> = {
  page: 1,
  limit: 20,
  sort: 'date_desc',
  searchTarget: 'keyword',
  startDate: '2025-04-26',
  bookmarkNumMin: 1000,
}

describe('searchFiltersModel', () => {
  it('keeps synced and optional filter key lists explicit', () => {
    const historyKeys = [
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
    ]

    expect(SEARCH_SYNCED_FILTER_KEYS).toEqual(['page', ...historyKeys])
    expect(SEARCH_OPTIONAL_FILTER_KEYS).toEqual([
      'tags',
      'authorId',
      ...historyKeys.slice(2),
    ])
  })

  it('resolves optional search params while preserving explicit undefined clears', () => {
    expect(
      resolveOptionalSearchParam({
        params: { startDate: undefined },
        filters: { startDate: '2025-04-26' },
        key: 'startDate',
      }),
    ).toBeUndefined()

    expect(
      resolveOptionalSearchParam({
        params: {},
        filters: { startDate: '2025-04-26' },
        key: 'startDate',
      }),
    ).toBe('2025-04-26')
  })

  it('resolves complete search params from store defaults and partial overrides', () => {
    expect(
      resolveSearchParams({
        query: 'cached',
        limit: 20,
        filters: baseFilters,
        params: {
          query: 'next',
          startDate: undefined,
          bookmarkNumMin: undefined,
        },
      }),
    ).toEqual({
      query: 'next',
      page: 1,
      limit: 20,
      sort: 'date_desc',
      tags: undefined,
      authorId: undefined,
      searchTarget: 'keyword',
      startDate: undefined,
      endDate: undefined,
      bookmarkNum: undefined,
      bookmarkNumMin: undefined,
      bookmarkNumMax: undefined,
      textLengthMin: undefined,
      lang: undefined,
      includePotentialViolationWorks: undefined,
      includeTranslatedTagResults: undefined,
      isOriginalOnly: undefined,
      isReplaceableOnly: undefined,
      mergePlainKeywordResults: undefined,
      searchAiType: undefined,
    })
  })

  it('syncs persisted filters from resolved search params while preserving non-synced fields', () => {
    expect(
      buildSyncedSearchFilters({
        currentFilters: {
          page: 7,
          limit: 20,
          sort: 'popular_desc',
          tags: ['keep-tag'],
          authorId: 'author-1',
          searchTarget: 'keyword',
          startDate: '2025-04-26',
          bookmarkNumMin: 1000,
          includeTranslatedTagResults: true,
        },
        searchParams: {
          query: '五悠',
          page: 1,
          limit: 50,
          sort: 'date_desc',
          tags: ['ignored-tag'],
          authorId: 'ignored-author',
          searchTarget: 'text',
          startDate: undefined,
          endDate: '2026-04-26',
          bookmarkNum: 100,
          bookmarkNumMin: undefined,
          bookmarkNumMax: 4999,
          textLengthMin: 3000,
          lang: 'ja',
          includePotentialViolationWorks: false,
          includeTranslatedTagResults: undefined,
          isOriginalOnly: false,
          isReplaceableOnly: false,
          mergePlainKeywordResults: true,
          searchAiType: '1',
        },
      }),
    ).toEqual({
      page: 1,
      limit: 20,
      sort: 'date_desc',
      tags: ['keep-tag'],
      authorId: 'author-1',
      searchTarget: 'text',
      startDate: undefined,
      endDate: '2026-04-26',
      bookmarkNum: 100,
      bookmarkNumMin: undefined,
      bookmarkNumMax: 4999,
      textLengthMin: 3000,
      lang: 'ja',
      includePotentialViolationWorks: false,
      includeTranslatedTagResults: undefined,
      isOriginalOnly: false,
      isReplaceableOnly: false,
      mergePlainKeywordResults: true,
      searchAiType: '1',
    })
  })

  it('builds merged search filter state while preserving explicit cleared values', () => {
    expect(
      buildSearchFiltersState({
        currentFilters: baseFilters,
        filters: {
          sort: 'popular_desc',
          startDate: undefined,
          bookmarkNumMax: 4999,
        },
      }),
    ).toEqual({
      filters: {
        page: 1,
        limit: 20,
        sort: 'popular_desc',
        searchTarget: 'keyword',
        startDate: undefined,
        bookmarkNumMin: 1000,
        bookmarkNumMax: 4999,
      },
    })
  })
})
