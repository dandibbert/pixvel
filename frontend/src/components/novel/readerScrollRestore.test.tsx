import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderReactElement } from '../../test/domTestUtils'
import { enableReactActEnvironment } from '../../test/reactActEnvironment'
import { useReaderStore } from '../../stores/readerStore'
import { READING_PROGRESS_STORAGE_KEY } from '../../utils/readingProgress'
import NovelReader from './NovelReader'
import type { NovelDetail } from '../../types/novel'

enableReactActEnvironment()

const mocks = vi.hoisted(() => {
  const novel = {
    id: 'novel-1',
    title: 'Test Novel',
    description: '',
    author: { id: 'author-1', name: 'Author' },
    tags: [],
    pageCount: 2,
    textLength: 100,
    totalBookmarks: 0,
    totalViews: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }

  return {
    novel,
    apiGet: vi.fn(async (endpoint: string) =>
      endpoint.endsWith('/content') ? { content: 'First page\n[newpage]\nSecond page' } : novel
    ),
  }
})

vi.mock('../../utils/api', () => ({
  api: {
    get: (endpoint: string) => mocks.apiGet(endpoint),
    post: vi.fn(async () => ({})),
  },
}))

vi.mock('../../i18n/useI18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const novel = mocks.novel as unknown as NovelDetail
const pages = [
  { page: 1, content: 'First page' },
  { page: 2, content: 'Second page' },
]

const scrollTo = vi.fn()

function setScrollY(offset: number) {
  Object.defineProperty(window, 'scrollY', { value: offset, configurable: true })
}

function storeProgress(page: number, offset: number) {
  localStorage.setItem(
    READING_PROGRESS_STORAGE_KEY,
    JSON.stringify({ [novel.id]: { page, offset, updatedAt: 1 } }),
  )
}

function loadFromCache(currentPage: number) {
  useReaderStore.setState({
    novel: null,
    pages: [],
    currentPage: 1,
    totalPages: 0,
    novelCache: { [novel.id]: { novel, pages, currentPage, timestamp: Date.now() } },
    cacheOrder: [novel.id],
  })

  return useReaderStore.getState().loadNovel(novel.id)
}

function loadWithoutCache() {
  useReaderStore.setState({
    novel: null,
    pages: [],
    currentPage: 1,
    totalPages: 0,
    novelCache: {},
    cacheOrder: [],
  })

  return useReaderStore.getState().loadNovel(novel.id)
}

function renderReader() {
  return renderReactElement(<NovelReader series={null} />, {
    wrapper: (children) => <MemoryRouter>{children}</MemoryRouter>,
  })
}

describe('reader scroll restoration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    scrollTo.mockReset()
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo
    setScrollY(0)
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 20000,
      configurable: true,
    })
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('saves the scroll offset while reading and returns to it on the next visit', async () => {
    await loadFromCache(1)
    const first = renderReader()

    setScrollY(5000)
    window.dispatchEvent(new Event('scroll'))
    vi.advanceTimersByTime(500)

    expect(localStorage.getItem(READING_PROGRESS_STORAGE_KEY)).toContain('5000')

    first.unmount()

    scrollTo.mockReset()
    setScrollY(0)
    await loadFromCache(1)
    const second = renderReader()

    expect(scrollTo).toHaveBeenCalledWith({ top: 5000, left: 0, behavior: 'auto' })

    second.unmount()
  })

  it('reopens on the saved page and offset after the novel fell out of the novel cache', async () => {
    storeProgress(2, 5000)

    await loadWithoutCache()
    const { unmount } = renderReader()

    expect(useReaderStore.getState().currentPage).toBe(2)
    expect(scrollTo).toHaveBeenCalledWith({ top: 5000, left: 0, behavior: 'auto' })

    unmount()
  })

  it('opens an uncached novel at the top when nothing was saved for it', async () => {
    await loadWithoutCache()
    const { unmount } = renderReader()

    expect(useReaderStore.getState().currentPage).toBe(1)
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })

    unmount()
  })
})
