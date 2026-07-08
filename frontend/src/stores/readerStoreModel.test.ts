import { describe, expect, it } from 'vitest'
import type { NovelDetail, NovelPage } from '../types/novel'
import {
  buildReaderLoadErrorLog,
  buildTimestampedReaderCacheHitState,
  buildTimestampedReaderPageChangeState,
  cacheReaderNovelWithTimestamp,
} from './readerStoreModel'

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

describe('readerStoreModel', () => {
  it('builds cache-hit load state using an injected timestamp source', () => {
    const novel = createNovel('1')
    const cache = {
      '1': { novel, pages, currentPage: 2, timestamp: 100 },
    }

    expect(
      buildTimestampedReaderCacheHitState({
        novelCache: cache,
        cacheOrder: ['1'],
        novelId: '1',
        forceRefresh: false,
        now: () => 500,
      }),
    ).toEqual({
      novel,
      pages,
      currentPage: 2,
      totalPages: 2,
      isLoading: false,
      cacheOrder: ['1'],
      novelCache: {
        '1': { novel, pages, currentPage: 2, timestamp: 500 },
      },
    })
  })

  it('caches freshly loaded novels using an injected timestamp source', () => {
    const novel = createNovel('1')

    expect(
      cacheReaderNovelWithTimestamp({
        novelCache: {},
        cacheOrder: [],
        novelId: '1',
        novel,
        pages,
        now: () => 600,
      }),
    ).toEqual({
      cacheOrder: ['1'],
      novelCache: {
        '1': { novel, pages, currentPage: 1, timestamp: 600 },
      },
    })
  })

  it('builds page-change state using an injected timestamp source', () => {
    const novel = createNovel('1')
    const cache = {
      '1': { novel, pages, currentPage: 1, timestamp: 100 },
    }

    expect(
      buildTimestampedReaderPageChangeState({
        page: 2,
        totalPages: 2,
        novelId: '1',
        novelCache: cache,
        now: () => 700,
      }),
    ).toEqual({
      currentPage: 2,
      novelCache: {
        '1': { novel, pages, currentPage: 2, timestamp: 700 },
      },
    })
  })

  it('builds a stable load-error log descriptor without altering the thrown value', () => {
    const error = new Error('ERR_READER_CONTENT_EMPTY')

    expect(buildReaderLoadErrorLog(error)).toEqual({
      label: 'Load novel error:',
      value: error,
    })
  })
})
