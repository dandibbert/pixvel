import type { Novel } from '../types/novel'

export interface AuthorSummary {
  id: string
  name: string
  avatar?: string
}

export interface AuthorNovelPageResponse {
  author: AuthorSummary
  novels: Novel[]
  page: number
  nextPage: number | null
  hasMore: boolean
}

export interface CachedAuthorNovelPage {
  novels: Novel[]
  nextPage: number | null
  hasMore: boolean
  timestamp: number
}

export interface CachedAuthorNovelEntry {
  author: AuthorSummary
  pages: Record<number, CachedAuthorNovelPage>
  pageOrder: number[]
  lastPage: number | null
}

export interface AuthorPageCacheSnapshot {
  authorCache: Record<string, CachedAuthorNovelEntry>
  cacheOrder: string[]
}

export const AUTHOR_PAGE_CACHE_MAX_AGE_MS = 30 * 60 * 1000
export const MAX_CACHED_AUTHORS = 8
export const MAX_CACHED_PAGES_PER_AUTHOR = 10

export function createEmptyAuthorPageCache(): AuthorPageCacheSnapshot {
  return {
    authorCache: {},
    cacheOrder: [],
  }
}

function moveToFront<T>(values: T[], value: T): T[] {
  return [value, ...values.filter((item) => item !== value)]
}

export function cacheAuthorNovelPage({
  authorCache,
  cacheOrder,
  authorId,
  response,
  timestamp,
  maxAuthors = MAX_CACHED_AUTHORS,
  maxPagesPerAuthor = MAX_CACHED_PAGES_PER_AUTHOR,
}: AuthorPageCacheSnapshot & {
  authorId: string
  response: AuthorNovelPageResponse
  timestamp: number
  maxAuthors?: number
  maxPagesPerAuthor?: number
}): AuthorPageCacheSnapshot {
  const currentEntry = authorCache[authorId]
  const nextPages = {
    ...currentEntry?.pages,
    [response.page]: {
      novels: response.novels,
      nextPage: response.nextPage,
      hasMore: response.hasMore,
      timestamp,
    },
  }
  const nextPageOrder = moveToFront(currentEntry?.pageOrder ?? [], response.page)
    .slice(0, maxPagesPerAuthor)
  const boundedPages = Object.fromEntries(
    nextPageOrder.map((page) => [page, nextPages[page]]),
  ) as Record<number, CachedAuthorNovelPage>
  const nextEntry: CachedAuthorNovelEntry = {
    author: response.author,
    pages: boundedPages,
    pageOrder: nextPageOrder,
    lastPage: response.hasMore ? currentEntry?.lastPage ?? null : response.page,
  }
  const nextCacheOrder = moveToFront(cacheOrder, authorId).slice(0, maxAuthors)
  const cacheWithPage = {
    ...authorCache,
    [authorId]: nextEntry,
  }

  return {
    authorCache: Object.fromEntries(
      nextCacheOrder.map((cachedAuthorId) => [cachedAuthorId, cacheWithPage[cachedAuthorId]]),
    ),
    cacheOrder: nextCacheOrder,
  }
}

export function isAuthorPageCacheFresh(
  cachedPage: CachedAuthorNovelPage | undefined,
  timestamp: number,
  maxAgeMs = AUTHOR_PAGE_CACHE_MAX_AGE_MS,
) {
  return Boolean(cachedPage && timestamp - cachedPage.timestamp <= maxAgeMs)
}

export function getKnownAuthorPageCount(
  entry: CachedAuthorNovelEntry | undefined,
  currentPage: number,
) {
  if (entry?.lastPage) return entry.lastPage

  const discoveredPages = entry
    ? Object.entries(entry.pages).flatMap(([page, cachedPage]) => [
        Number(page),
        cachedPage.nextPage ?? 0,
      ])
    : []

  return Math.max(1, currentPage, ...discoveredPages)
}

export function normalizeAuthorPage(page: number) {
  return Number.isInteger(page) && page > 0 ? page : 1
}

export function buildAuthorPagePersistSnapshot<State extends AuthorPageCacheSnapshot>(
  state: State,
): AuthorPageCacheSnapshot {
  return {
    authorCache: state.authorCache,
    cacheOrder: state.cacheOrder,
  }
}
