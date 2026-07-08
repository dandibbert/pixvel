import { describe, expect, it } from 'vitest'
import type { SearchHistoryEntry } from '../types/search'
import {
  addSearchHistoryEntry,
  buildClearedSearchHistoryState,
  buildRemovedSearchHistoryState,
  buildSearchHistoryState,
  createSearchHistoryEntry,
  removeSearchHistoryEntry,
  SEARCH_HISTORY_ENTRY_KEYS,
} from './searchHistoryModel'

function createHistoryEntry(query: string, timestamp: number): SearchHistoryEntry {
  return {
    query,
    sort: 'date_desc',
    searchTarget: 'keyword',
    timestamp,
  }
}

describe('searchHistoryModel', () => {
  it('keeps history entry keys reusable for payload creation and dedupe', () => {
    expect(SEARCH_HISTORY_ENTRY_KEYS).toEqual([
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
    ])
  })

  it('creates compact history payloads with legacy defaults', () => {
    expect(
      createSearchHistoryEntry({
        query: '五悠',
        sort: undefined,
        searchTarget: undefined,
        bookmarkNumMin: 1000,
      }),
    ).toEqual({
      query: '五悠',
      sort: 'date_desc',
      searchTarget: 'partial_match_for_tags',
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
    })
  })

  it('dedupes matching history entries and caps the list at ten items', () => {
    const existing = Array.from({ length: 10 }, (_, index) =>
      createHistoryEntry(`query-${index}`, index)
    )

    const deduped = addSearchHistoryEntry(
      existing,
      {
        query: 'query-4',
        sort: 'date_desc',
        searchTarget: 'keyword',
      },
      100,
    )

    expect(deduped).toHaveLength(10)
    expect(deduped[0]).toEqual(createHistoryEntry('query-4', 100))
    expect(deduped.filter((entry) => entry.query === 'query-4')).toHaveLength(1)
    expect(deduped.some((entry) => entry.query === 'query-9')).toBe(true)

    const capped = addSearchHistoryEntry(
      existing,
      {
        query: 'fresh-query',
        sort: 'date_desc',
        searchTarget: 'keyword',
      },
      200,
    )

    expect(capped).toHaveLength(10)
    expect(capped[0].query).toBe('fresh-query')
    expect(capped.some((entry) => entry.query === 'query-9')).toBe(false)
  })

  it('builds timestamped history state and clear state payloads', () => {
    const existing = [createHistoryEntry('old', 100)]

    expect(
      buildSearchHistoryState({
        searchHistory: existing,
        entry: {
          query: 'fresh',
          sort: 'popular_desc',
          searchTarget: 'text',
        },
        now: () => 500,
      }),
    ).toEqual({
      searchHistory: [
        {
          query: 'fresh',
          sort: 'popular_desc',
          searchTarget: 'text',
          timestamp: 500,
        },
        existing[0],
      ],
    })

    expect(buildClearedSearchHistoryState()).toEqual({
      searchHistory: [],
    })
  })

  it('removes history entries by index without mutating the existing list', () => {
    const existing = [
      createHistoryEntry('first', 1),
      createHistoryEntry('second', 2),
      createHistoryEntry('third', 3),
    ]

    expect(removeSearchHistoryEntry(existing, 1)).toEqual([
      existing[0],
      existing[2],
    ])
    expect(
      buildRemovedSearchHistoryState({
        searchHistory: existing,
        index: 1,
      }),
    ).toEqual({
      searchHistory: [existing[0], existing[2]],
    })
    expect(existing.map((entry) => entry.query)).toEqual(['first', 'second', 'third'])
  })
})
