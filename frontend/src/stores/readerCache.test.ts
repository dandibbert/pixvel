import { describe, expect, it } from 'vitest'
import type { NovelDetail, NovelPage } from '../types/novel'
import {
  buildCachedReaderLoadState,
  buildClearedReaderLoadState,
  buildFreshReaderLoadState,
  buildReaderCacheHitLoadState,
  buildNovelPages,
  buildReaderClearErrorState,
  buildReaderErrorState,
  buildReaderLoadingState,
  buildReaderPersistSnapshot,
  buildReaderPageChangeState,
  cacheReaderNovel,
  touchCachedReaderNovel,
  updateCachedReaderPage,
} from './readerCache'

function createNovel(id: string): NovelDetail {
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
    content: '',
    pages: [],
  }
}

const pages: NovelPage[] = [
  { page: 1, content: 'first' },
  { page: 2, content: 'second' },
]

describe('readerCache', () => {
  it('builds one-based reader pages from novel text', () => {
    expect(buildNovelPages('first[newpage]second')).toEqual(pages)
  })

  it('inserts cache entries at the front and evicts the least recently used item', () => {
    const first = cacheReaderNovel({
      novelCache: {},
      cacheOrder: [],
      novelId: '1',
      novel: createNovel('1'),
      pages,
      timestamp: 100,
      maxSize: 2,
    })
    const second = cacheReaderNovel({
      ...first,
      novelId: '2',
      novel: createNovel('2'),
      pages,
      timestamp: 200,
      maxSize: 2,
    })
    const third = cacheReaderNovel({
      ...second,
      novelId: '3',
      novel: createNovel('3'),
      pages,
      timestamp: 300,
      maxSize: 2,
    })

    expect(third.cacheOrder).toEqual(['3', '2'])
    expect(third.novelCache['1']).toBeUndefined()
    expect(third.novelCache['3'].timestamp).toBe(300)
  })

  it('moves touched cache entries to the front and refreshes timestamps', () => {
    const cache = {
      '1': { novel: createNovel('1'), pages, currentPage: 1, timestamp: 100 },
      '2': { novel: createNovel('2'), pages, currentPage: 1, timestamp: 200 },
    }

    const touched = touchCachedReaderNovel({
      novelCache: cache,
      cacheOrder: ['2', '1'],
      novelId: '1',
      timestamp: 300,
    })

    expect(touched.cacheOrder).toEqual(['1', '2'])
    expect(touched.novelCache['1'].timestamp).toBe(300)
  })

  it('builds reader state from a touched cached novel', () => {
    const cache = {
      '1': { novel: createNovel('1'), pages, currentPage: 2, timestamp: 100 },
      '2': { novel: createNovel('2'), pages, currentPage: 1, timestamp: 200 },
    }
    const touched = touchCachedReaderNovel({
      novelCache: cache,
      cacheOrder: ['2', '1'],
      novelId: '1',
      timestamp: 300,
    })

    expect(
      buildCachedReaderLoadState({
        cached: cache['1'],
        touchedCache: touched,
      }),
    ).toEqual({
      novel: cache['1'].novel,
      pages,
      currentPage: 2,
      totalPages: 2,
      isLoading: false,
      cacheOrder: ['1', '2'],
      novelCache: touched.novelCache,
    })
  })

  it('builds reader cache hit load state and refreshes cache recency', () => {
    const cache = {
      '1': { novel: createNovel('1'), pages, currentPage: 2, timestamp: 100 },
      '2': { novel: createNovel('2'), pages, currentPage: 1, timestamp: 200 },
    }

    expect(
      buildReaderCacheHitLoadState({
        novelCache: cache,
        cacheOrder: ['2', '1'],
        novelId: '1',
        forceRefresh: false,
        timestamp: 300,
      }),
    ).toEqual({
      novel: cache['1'].novel,
      pages,
      currentPage: 2,
      totalPages: 2,
      isLoading: false,
      cacheOrder: ['1', '2'],
      novelCache: {
        ...cache,
        '1': { ...cache['1'], timestamp: 300 },
      },
    })
  })

  it('does not build cache hit load state for forced refreshes or misses', () => {
    const cache = {
      '1': { novel: createNovel('1'), pages, currentPage: 1, timestamp: 100 },
    }

    expect(
      buildReaderCacheHitLoadState({
        novelCache: cache,
        cacheOrder: ['1'],
        novelId: '1',
        forceRefresh: true,
        timestamp: 300,
      }),
    ).toBeNull()
    expect(
      buildReaderCacheHitLoadState({
        novelCache: cache,
        cacheOrder: ['1'],
        novelId: 'missing',
        forceRefresh: false,
        timestamp: 300,
      }),
    ).toBeNull()
  })

  it('builds reader state from a freshly loaded novel and updated cache', () => {
    const novel = createNovel('1')
    const updatedCache = cacheReaderNovel({
      novelCache: {},
      cacheOrder: [],
      novelId: '1',
      novel,
      pages,
      timestamp: 300,
    })

    expect(
      buildFreshReaderLoadState({
        novel,
        pages,
        updatedCache,
      }),
    ).toEqual({
      novel,
      pages,
      totalPages: 2,
      currentPage: 1,
      isLoading: false,
      novelCache: updatedCache.novelCache,
      cacheOrder: updatedCache.cacheOrder,
    })
  })

  it('opens a freshly loaded novel on a requested page, bounded by its length', () => {
    const novel = createNovel('1')
    const updatedCache = { novelCache: {}, cacheOrder: [] }

    const buildOnPage = (currentPage: number) =>
      buildFreshReaderLoadState({ novel, pages, updatedCache, currentPage }).currentPage

    expect(buildOnPage(2)).toBe(2)
    expect(buildOnPage(9)).toBe(2)
    expect(buildOnPage(0)).toBe(1)
    expect(buildOnPage(Number.NaN)).toBe(1)
  })

  it('builds the cleared reader load state', () => {
    expect(buildClearedReaderLoadState()).toEqual({
      novel: null,
      pages: [],
      currentPage: 1,
      totalPages: 0,
    })
  })

  it('builds transient reader loading and clear-error states', () => {
    expect(buildReaderLoadingState()).toEqual({
      isLoading: true,
      error: null,
    })

    expect(buildReaderClearErrorState()).toEqual({
      error: null,
    })
  })

  it('builds reader load error state from known and unknown thrown values', () => {
    expect(buildReaderErrorState(new Error('ERR_READER_CONTENT_EMPTY'))).toEqual({
      error: 'ERR_READER_CONTENT_EMPTY',
      isLoading: false,
    })
    expect(buildReaderErrorState('bad response')).toEqual({
      error: 'ERR_READER_LOAD_FAILED',
      isLoading: false,
    })
  })

  it('builds the persisted reader cache snapshot without active reader state', () => {
    const novel = createNovel('1')
    const cache = {
      '1': { novel, pages, currentPage: 2, timestamp: 100 },
    }

    expect(
      buildReaderPersistSnapshot({
        novel,
        pages,
        currentPage: 2,
        totalPages: 2,
        isLoading: true,
        error: 'ERR_READER_LOAD_FAILED',
        novelCache: cache,
        cacheOrder: ['1'],
      }),
    ).toEqual({
      novelCache: cache,
      cacheOrder: ['1'],
    })
  })

  it('builds reader page change state with cached reading progress', () => {
    const novel = createNovel('1')
    const cache = {
      '1': { novel, pages, currentPage: 1, timestamp: 100 },
    }

    const pageChange = buildReaderPageChangeState({
      page: 2,
      totalPages: 2,
      novelId: '1',
      novelCache: cache,
      timestamp: 300,
    })

    expect(pageChange).toEqual({
      currentPage: 2,
      novelCache: {
        '1': { novel, pages, currentPage: 2, timestamp: 300 },
      },
    })
    expect(cache['1'].currentPage).toBe(1)
  })

  it('returns no reader page change state for out-of-range pages', () => {
    expect(
      buildReaderPageChangeState({
        page: 3,
        totalPages: 2,
        novelId: '1',
        novelCache: {},
        timestamp: 300,
      }),
    ).toBeNull()
  })

  it('updates cached reading progress without mutating the original cache', () => {
    const cache = {
      '1': { novel: createNovel('1'), pages, currentPage: 1, timestamp: 100 },
    }

    const updated = updateCachedReaderPage(cache, '1', 2, 300)

    expect(updated['1'].currentPage).toBe(2)
    expect(updated['1'].timestamp).toBe(300)
    expect(cache['1'].currentPage).toBe(1)
  })

  it('returns the same cache reference when updating a missing entry', () => {
    const cache = {
      '1': { novel: createNovel('1'), pages, currentPage: 1, timestamp: 100 },
    }

    expect(updateCachedReaderPage(cache, 'missing', 2, 300)).toBe(cache)
  })
})
