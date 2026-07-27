import type { NovelDetail, NovelPage } from '../types/novel'
import { READER_ERROR_CODES } from '../pages/readerPageModel'
import { getErrorMessage } from '../utils/errorLog'
import { splitByNewpage } from '../utils/novelTextParser'

export interface CachedNovel {
  novel: NovelDetail
  pages: NovelPage[]
  currentPage: number
  timestamp: number
}

export interface NovelCache {
  [novelId: string]: CachedNovel
}

// Full novel text is persisted to localStorage. Keep the LRU deliberately
// small to stay below typical ~5 MiB browser quotas and keep startup JSON
// hydration off the main-thread hot path as much as possible.
export const MAX_READER_CACHE_SIZE = 5

interface ReaderCacheState {
  novelCache: NovelCache
  cacheOrder: string[]
}

export type ReaderPersistSnapshot = ReaderCacheState

export function buildNovelPages(content: string): NovelPage[] {
  return splitByNewpage(content).map((text, index) => ({
    page: index + 1,
    content: text,
  }))
}

function moveCacheEntryToFront(cacheOrder: string[], novelId: string): string[] {
  return [novelId, ...cacheOrder.filter((id) => id !== novelId)]
}

function evictOldestCache(
  novelCache: NovelCache,
  cacheOrder: string[],
  maxSize: number,
): { novelCache: NovelCache; cacheOrder: string[] } {
  if (cacheOrder.length <= maxSize) {
    return { novelCache, cacheOrder }
  }

  const oldestId = cacheOrder[cacheOrder.length - 1]
  const nextCache = { ...novelCache }
  delete nextCache[oldestId]

  return {
    novelCache: nextCache,
    cacheOrder: cacheOrder.slice(0, -1),
  }
}

export function cacheReaderNovel({
  novelCache,
  cacheOrder,
  novelId,
  novel,
  pages,
  timestamp,
  currentPage = 1,
  maxSize = MAX_READER_CACHE_SIZE,
}: {
  novelCache: NovelCache
  cacheOrder: string[]
  novelId: string
  novel: NovelDetail
  pages: NovelPage[]
  timestamp: number
  currentPage?: number
  maxSize?: number
}) {
  return evictOldestCache(
    {
      ...novelCache,
      [novelId]: {
        novel,
        pages,
        currentPage,
        timestamp,
      },
    },
    moveCacheEntryToFront(cacheOrder, novelId),
    maxSize,
  )
}

export function touchCachedReaderNovel({
  novelCache,
  cacheOrder,
  novelId,
  timestamp,
}: {
  novelCache: NovelCache
  cacheOrder: string[]
  novelId: string
  timestamp: number
}) {
  const cached = novelCache[novelId]
  if (!cached) {
    return { novelCache, cacheOrder }
  }

  return {
    novelCache: {
      ...novelCache,
      [novelId]: {
        ...cached,
        timestamp,
      },
    },
    cacheOrder: moveCacheEntryToFront(cacheOrder, novelId),
  }
}

export function buildCachedReaderLoadState({
  cached,
  touchedCache,
}: {
  cached: CachedNovel
  touchedCache: ReaderCacheState
}) {
  return {
    novel: cached.novel,
    pages: cached.pages,
    currentPage: cached.currentPage,
    totalPages: cached.pages.length,
    isLoading: false,
    cacheOrder: touchedCache.cacheOrder,
    novelCache: touchedCache.novelCache,
  }
}

export function buildReaderCacheHitLoadState({
  novelCache,
  cacheOrder,
  novelId,
  forceRefresh,
  timestamp,
}: {
  novelCache: NovelCache
  cacheOrder: string[]
  novelId: string
  forceRefresh: boolean
  timestamp: number
}) {
  if (forceRefresh) return null

  const cached = novelCache[novelId]
  if (!cached) return null

  return buildCachedReaderLoadState({
    cached,
    touchedCache: touchCachedReaderNovel({
      novelCache,
      cacheOrder,
      novelId,
      timestamp,
    }),
  })
}

export function buildFreshReaderLoadState({
  novel,
  pages,
  updatedCache,
}: {
  novel: NovelDetail
  pages: NovelPage[]
  updatedCache: ReaderCacheState
}) {
  return {
    novel,
    pages,
    totalPages: pages.length,
    currentPage: 1,
    isLoading: false,
    novelCache: updatedCache.novelCache,
    cacheOrder: updatedCache.cacheOrder,
  }
}

export function buildClearedReaderLoadState() {
  return {
    novel: null,
    pages: [],
    currentPage: 1,
    totalPages: 0,
  }
}

export function buildReaderLoadingState() {
  return {
    isLoading: true,
    error: null,
  }
}

export function buildReaderClearErrorState() {
  return {
    error: null,
  }
}

export function buildReaderErrorState(error: unknown) {
  return {
    error: getErrorMessage(error, READER_ERROR_CODES.loadFailed),
    isLoading: false,
  }
}

export function buildReaderPersistSnapshot<State extends ReaderCacheState>(
  state: State,
): ReaderPersistSnapshot {
  return {
    novelCache: state.novelCache,
    cacheOrder: state.cacheOrder,
  }
}

export function buildReaderPageChangeState({
  page,
  totalPages,
  novelId,
  novelCache,
  timestamp,
}: {
  page: number
  totalPages: number
  novelId?: string
  novelCache: NovelCache
  timestamp: number
}) {
  if (page < 1 || page > totalPages) {
    return null
  }

  if (!novelId) {
    return { currentPage: page }
  }

  const updatedCache = updateCachedReaderPage(novelCache, novelId, page, timestamp)

  if (updatedCache === novelCache) {
    return { currentPage: page }
  }

  return {
    currentPage: page,
    novelCache: updatedCache,
  }
}

export function updateCachedReaderPage(
  novelCache: NovelCache,
  novelId: string,
  currentPage: number,
  timestamp: number,
) {
  const cached = novelCache[novelId]
  if (!cached) return novelCache

  return {
    ...novelCache,
    [novelId]: {
      ...cached,
      currentPage,
      timestamp,
    },
  }
}
