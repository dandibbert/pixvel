import { describe, expect, it } from 'vitest'
import type { Novel } from '../types/novel'
import {
  cacheAuthorNovelPage,
  createEmptyAuthorPageCache,
  getKnownAuthorPageCount,
  isAuthorPageCacheFresh,
  normalizeAuthorPage,
} from './authorPageCache'

function createNovel(id: string): Novel {
  return {
    id,
    title: `Novel ${id}`,
    description: '',
    author: { id: 'author-1', name: 'Author' },
    tags: [],
    pageCount: 1,
    textLength: 1000,
    totalBookmarks: 0,
    totalViews: 0,
    createdAt: '2026-04-26T00:00:00.000Z',
    updatedAt: '2026-04-26T00:00:00.000Z',
  }
}

function cachePage(
  state = createEmptyAuthorPageCache(),
  page = 1,
  hasMore = true,
) {
  return cacheAuthorNovelPage({
    ...state,
    authorId: 'author-1',
    response: {
      author: { id: 'author-1', name: 'Author' },
      novels: [createNovel(String(page))],
      page,
      nextPage: hasMore ? page + 1 : null,
      hasMore,
    },
    timestamp: page * 100,
  })
}

describe('authorPageCache', () => {
  it('stores separate pages and exposes the next discoverable page', () => {
    const firstPage = cachePage()
    const secondPage = cachePage(firstPage, 2)
    const entry = secondPage.authorCache['author-1']

    expect(entry.pages[1].novels[0].id).toBe('1')
    expect(entry.pages[2].novels[0].id).toBe('2')
    expect(getKnownAuthorPageCount(entry, 2)).toBe(3)
  })

  it('uses the terminal response as the exact final page', () => {
    const terminal = cachePage(cachePage(), 2, false)

    expect(terminal.authorCache['author-1'].lastPage).toBe(2)
    expect(getKnownAuthorPageCount(terminal.authorCache['author-1'], 2)).toBe(2)
  })

  it('treats recent pages as fresh and expires old pages', () => {
    const cached = cachePage().authorCache['author-1'].pages[1]

    expect(isAuthorPageCacheFresh(cached, 150, 100)).toBe(true)
    expect(isAuthorPageCacheFresh(cached, 201, 100)).toBe(false)
  })

  it('normalizes invalid URL pages to the first page', () => {
    expect(normalizeAuthorPage(3)).toBe(3)
    expect(normalizeAuthorPage(0)).toBe(1)
    expect(normalizeAuthorPage(2.5)).toBe(1)
    expect(normalizeAuthorPage(Number.NaN)).toBe(1)
  })

  it('bounds cached authors and pages using least-recently-used order', () => {
    let state = createEmptyAuthorPageCache()
    for (let page = 1; page <= 3; page += 1) {
      state = cacheAuthorNovelPage({
        ...state,
        authorId: 'author-1',
        response: {
          author: { id: 'author-1', name: 'Author' },
          novels: [createNovel(String(page))],
          page,
          nextPage: page + 1,
          hasMore: true,
        },
        timestamp: page,
        maxAuthors: 2,
        maxPagesPerAuthor: 2,
      })
    }

    expect(Object.keys(state.authorCache['author-1'].pages)).toEqual(['2', '3'])

    for (const authorId of ['author-2', 'author-3']) {
      state = cacheAuthorNovelPage({
        ...state,
        authorId,
        response: {
          author: { id: authorId, name: authorId },
          novels: [],
          page: 1,
          nextPage: null,
          hasMore: false,
        },
        timestamp: Number(authorId.at(-1)) + 10,
        maxAuthors: 2,
        maxPagesPerAuthor: 2,
      })
    }

    expect(Object.keys(state.authorCache).sort()).toEqual(['author-2', 'author-3'])
  })
})
