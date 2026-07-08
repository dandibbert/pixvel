import { describe, expect, it } from 'vitest'
import {
  buildPagedNovelErrorState,
  buildPagedNovelLoadMoreState,
  buildPagedNovelLoadingState,
  createEmptyPagedNovelState,
  getNextPagedNovelPage,
  mergePagedNovelResponse,
  type PagedNovelResponse,
} from './usePagedNovelResource'
import type { Novel } from '../types/novel'

interface ResourceMeta {
  id: string
  title: string
}

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

function createResponse(page: number, novels: Novel[]): PagedNovelResponse<ResourceMeta> {
  return {
    resource: {
      id: 'resource-1',
      title: 'Resource',
    },
    novels,
    page,
    nextPage: page + 1,
    hasMore: true,
  }
}

describe('paged novel resource model', () => {
  it('starts with empty list state', () => {
    expect(createEmptyPagedNovelState<ResourceMeta>()).toEqual({
      resource: null,
      novels: [],
      page: 1,
      nextPage: null,
      hasMore: false,
      isLoading: false,
      error: null,
    })
  })

  it('replaces novels for the first page and appends later pages', () => {
    const firstPage = mergePagedNovelResponse(
      createEmptyPagedNovelState<ResourceMeta>(),
      createResponse(1, [createNovel('1')]),
    )
    const secondPage = mergePagedNovelResponse(
      firstPage,
      createResponse(2, [createNovel('2')]),
    )

    expect(firstPage.novels.map((novel) => novel.id)).toEqual(['1'])
    expect(secondPage.novels.map((novel) => novel.id)).toEqual(['1', '2'])
  })

  it('uses explicit nextPage before falling back to page + 1', () => {
    expect(getNextPagedNovelPage({
      ...createEmptyPagedNovelState<ResourceMeta>(),
      page: 4,
      nextPage: 9,
      hasMore: true,
    })).toBe(9)

    expect(getNextPagedNovelPage({
      ...createEmptyPagedNovelState<ResourceMeta>(),
      page: 4,
      nextPage: null,
      hasMore: true,
    })).toBe(5)

    expect(getNextPagedNovelPage({
      ...createEmptyPagedNovelState<ResourceMeta>(),
      page: 4,
      nextPage: 9,
      hasMore: false,
    })).toBeNull()
  })

  it('builds loading and error states without dropping existing data', () => {
    const existingState = mergePagedNovelResponse(
      createEmptyPagedNovelState<ResourceMeta>(),
      createResponse(1, [createNovel('1')]),
    )

    expect(buildPagedNovelLoadingState({
      ...existingState,
      error: 'previous failure',
    })).toEqual({
      ...existingState,
      isLoading: true,
      error: null,
    })

    expect(buildPagedNovelErrorState(existingState, 'Load failed')).toEqual({
      ...existingState,
      isLoading: false,
      error: 'Load failed',
    })
  })

  it('advances to the next load-more page only when idle and more pages exist', () => {
    const readyState = {
      ...createEmptyPagedNovelState<ResourceMeta>(),
      page: 2,
      nextPage: 5,
      hasMore: true,
    }

    expect(buildPagedNovelLoadMoreState(readyState)).toEqual({
      ...readyState,
      page: 5,
    })
    const loadingState = {
      ...readyState,
      isLoading: true,
    }
    expect(buildPagedNovelLoadMoreState(loadingState)).toBe(loadingState)
    expect(buildPagedNovelLoadMoreState({
      ...readyState,
      hasMore: false,
    })).toEqual({
      ...readyState,
      hasMore: false,
    })
  })
})
