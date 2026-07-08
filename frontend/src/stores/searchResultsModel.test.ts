import { describe, expect, it } from 'vitest'
import type { Novel } from '../types/search'
import {
  buildClearedSearchResultsState,
  buildSearchResultsState,
  buildSearchResultsWithFiltersState,
} from './searchResultsModel'

function createNovel(id: string): Novel {
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

describe('searchResultsModel', () => {
  it('builds replacement and appended result states with derived hasMore', () => {
    const existingNovel = createNovel('existing')
    const nextNovel = createNovel('next')

    expect(
      buildSearchResultsState({
        result: {
          novels: [nextNovel],
          total: 30,
          page: 2,
          totalPages: 3,
        },
      }),
    ).toEqual({
      results: [nextNovel],
      total: 30,
      page: 2,
      totalPages: 3,
      hasMore: true,
      isLoading: false,
    })

    expect(
      buildSearchResultsState({
        result: {
          novels: [nextNovel],
          total: 30,
          page: 3,
          totalPages: 3,
        },
        existingResults: [existingNovel],
      }),
    ).toEqual({
      results: [existingNovel, nextNovel],
      total: 30,
      page: 3,
      totalPages: 3,
      hasMore: false,
      isLoading: false,
    })
  })

  it('builds first-page search result state with synced filters', () => {
    const nextNovel = createNovel('next')

    expect(
      buildSearchResultsWithFiltersState({
        result: {
          novels: [nextNovel],
          total: 30,
          page: 2,
          totalPages: 3,
        },
        filters: {
          page: 1,
          limit: 20,
          sort: 'popular_desc',
          searchTarget: 'keyword',
          bookmarkNumMin: 1000,
        },
      }),
    ).toEqual({
      results: [nextNovel],
      total: 30,
      page: 2,
      totalPages: 3,
      hasMore: true,
      isLoading: false,
      filters: {
        page: 1,
        limit: 20,
        sort: 'popular_desc',
        searchTarget: 'keyword',
        bookmarkNumMin: 1000,
      },
    })
  })

  it('builds cleared search result state', () => {
    expect(buildClearedSearchResultsState()).toEqual({
      results: [],
      total: 0,
      page: 1,
      totalPages: 1,
      hasMore: false,
    })
  })
})
