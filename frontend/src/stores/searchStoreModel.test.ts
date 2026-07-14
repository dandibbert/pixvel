import { describe, expect, it } from 'vitest'
import type { SearchHistoryEntry } from '../types/search'
import {
  buildSearchClearErrorState,
  buildSearchErrorState,
  buildSearchPageState,
  buildSearchQueryState,
  buildSearchLoadingState,
  buildSearchPersistSnapshot,
} from './searchStoreModel'

function createNovel(id: string) {
  return {
    id,
    title: `Novel ${id}`,
    description: '',
    author: {
      id: `author-${id}`,
      name: 'Author',
    },
    tags: [],
    pageCount: 1,
    textLength: 1000,
    totalBookmarks: 0,
    totalViews: 0,
    createdAt: '2026-04-26T00:00:00.000Z',
    updatedAt: '2026-04-26T00:00:00.000Z',
  }
}

describe('searchStoreModel', () => {
  it('builds search request loading and error states', () => {
    expect(buildSearchLoadingState()).toEqual({
      isLoading: true,
      error: null,
    })

    expect(buildSearchErrorState(new Error('ERR_SEARCH_FAILED'), 'Search failed')).toEqual({
      error: 'ERR_SEARCH_FAILED',
      isLoading: false,
    })

    expect(buildSearchErrorState('bad response', 'Load more failed')).toEqual({
      error: 'Load more failed',
      isLoading: false,
    })
  })

  it('builds the clear-error state without touching search results', () => {
    expect(buildSearchClearErrorState()).toEqual({
      error: null,
    })
  })

  it('builds the persisted search snapshot without transient request state', () => {
    const novel = createNovel('persisted')
    const historyEntry: SearchHistoryEntry = {
      query: '五悠',
      sort: 'date_desc',
      searchTarget: 'keyword',
      timestamp: 100,
    }

    expect(
      buildSearchPersistSnapshot({
        searchHistory: [historyEntry],
        query: '五悠',
        filters: {
          page: 2,
          limit: 50,
          sort: 'popular_desc',
          searchTarget: 'keyword',
        },
        results: [novel],
        total: 25,
        page: 2,
        totalPages: 3,
        visibleResultCount: 10,
        limit: 50,
        hasMore: true,
        isLoading: true,
        error: 'ERR_SEARCH_FAILED',
      }),
    ).toEqual({
      searchHistory: [historyEntry],
      query: '五悠',
      filters: {
        page: 2,
        limit: 50,
        sort: 'popular_desc',
        searchTarget: 'keyword',
      },
      results: [novel],
      total: 25,
      page: 2,
      totalPages: 3,
      hasMore: true,
      visibleResultCount: 10,
    })
  })

  it('builds simple search store state payloads', () => {
    expect(buildSearchQueryState('五悠')).toEqual({
      query: '五悠',
    })
    expect(buildSearchPageState(3)).toEqual({
      page: 3,
    })
  })

})
