import { describe, expect, it } from 'vitest'
import type { NovelDetail } from '../types/novel'
import {
  buildReaderDocumentTitle,
  resolveReaderErrorMessage,
  shouldShowReaderInitialLoading,
} from './readerPageModel'

const translations: Record<string, string> = {
  'reader.documentTitleLoading': '加载小说中 - Pixvel',
  'reader.documentTitleError': '阅读失败 - Pixvel',
  'reader.documentTitleDefault': '阅读小说 - Pixvel',
  'reader.contentEmptyError': '小说内容为空',
  'reader.loadFailedError': '加载小说失败',
}

const t = (key: string) => translations[key] ?? key

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

describe('readerPageModel', () => {
  it('shows the initial loading state only while the requested novel is missing or stale', () => {
    expect(shouldShowReaderInitialLoading({
      isLoading: true,
      requestedNovelId: 'novel-1',
      loadedNovel: null,
    })).toBe(true)

    expect(shouldShowReaderInitialLoading({
      isLoading: true,
      requestedNovelId: 'novel-1',
      loadedNovel: createNovel('novel-2'),
    })).toBe(true)

    expect(shouldShowReaderInitialLoading({
      isLoading: true,
      requestedNovelId: 'novel-1',
      loadedNovel: createNovel('novel-1'),
    })).toBe(false)
  })

  it('builds reader document titles with the same priority as the page', () => {
    expect(buildReaderDocumentTitle({
      shouldShowInitialLoading: true,
      novelTitle: 'Ignored',
      currentPage: 1,
      totalPages: 2,
      error: null,
      t,
    })).toBe('加载小说中 - Pixvel')

    expect(buildReaderDocumentTitle({
      shouldShowInitialLoading: false,
      novelTitle: 'Loaded Novel',
      currentPage: 2,
      totalPages: 5,
      error: 'ERR_READER_LOAD_FAILED',
      t,
    })).toBe('Loaded Novel (2/5) - Pixvel')

    expect(buildReaderDocumentTitle({
      shouldShowInitialLoading: false,
      novelTitle: 'Loaded Novel',
      currentPage: 1,
      totalPages: 0,
      error: null,
      t,
    })).toBe('Loaded Novel - Pixvel')

    expect(buildReaderDocumentTitle({
      shouldShowInitialLoading: false,
      novelTitle: undefined,
      currentPage: 1,
      totalPages: 0,
      error: 'ERR_READER_LOAD_FAILED',
      t,
    })).toBe('阅读失败 - Pixvel')

    expect(buildReaderDocumentTitle({
      shouldShowInitialLoading: false,
      novelTitle: undefined,
      currentPage: 1,
      totalPages: 0,
      error: null,
      t,
    })).toBe('阅读小说 - Pixvel')
  })

  it('maps known reader error codes and preserves unknown error text', () => {
    expect(resolveReaderErrorMessage('ERR_READER_CONTENT_EMPTY', t)).toBe('小说内容为空')
    expect(resolveReaderErrorMessage('ERR_READER_LOAD_FAILED', t)).toBe('加载小说失败')
    expect(resolveReaderErrorMessage('Network down', t)).toBe('Network down')
  })
})
