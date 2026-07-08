import type { NovelDetail, NovelPage } from '../types/novel'
import {
  buildReaderCacheHitLoadState,
  buildReaderPageChangeState,
  cacheReaderNovel,
  type NovelCache,
} from './readerCache'

type NowFn = () => number

export function buildTimestampedReaderCacheHitState({
  novelCache,
  cacheOrder,
  novelId,
  forceRefresh,
  now = Date.now,
}: {
  novelCache: NovelCache
  cacheOrder: string[]
  novelId: string
  forceRefresh: boolean
  now?: NowFn
}) {
  return buildReaderCacheHitLoadState({
    novelCache,
    cacheOrder,
    novelId,
    forceRefresh,
    timestamp: now(),
  })
}

export function cacheReaderNovelWithTimestamp({
  novelCache,
  cacheOrder,
  novelId,
  novel,
  pages,
  now = Date.now,
}: {
  novelCache: NovelCache
  cacheOrder: string[]
  novelId: string
  novel: NovelDetail
  pages: NovelPage[]
  now?: NowFn
}) {
  return cacheReaderNovel({
    novelCache,
    cacheOrder,
    novelId,
    novel,
    pages,
    timestamp: now(),
  })
}

export function buildTimestampedReaderPageChangeState({
  page,
  totalPages,
  novelId,
  novelCache,
  now = Date.now,
}: {
  page: number
  totalPages: number
  novelId?: string
  novelCache: NovelCache
  now?: NowFn
}) {
  return buildReaderPageChangeState({
    page,
    totalPages,
    novelId,
    novelCache,
    timestamp: now(),
  })
}

export function buildReaderLoadErrorLog(error: unknown) {
  return {
    label: 'Load novel error:',
    value: error,
  }
}
