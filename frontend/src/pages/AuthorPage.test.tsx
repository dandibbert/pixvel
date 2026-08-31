import { act } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clickButtonContainingText, renderReactElement } from '../test/domTestUtils'
import type { Novel } from '../types/novel'
import { createEmptyAuthorPageCache } from '../stores/authorPageCache'

vi.mock('../utils/api', () => ({
  api: { get: vi.fn() },
}))

vi.mock('../utils/pageScroll', () => ({
  scrollViewportToTop: vi.fn(),
}))

vi.mock('../components/novel/NovelPreviewModal', () => ({
  default: () => null,
}))

vi.mock('../components/novel/NovelGrid', () => ({
  default: ({ novels }: { novels: Novel[] }) => (
    <div data-testid="novel-grid">
      {novels.map((novel) => <span key={novel.id}>{novel.title}</span>)}
    </div>
  ),
}))

vi.mock('../components/common/Pagination', () => ({
  default: ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }) => totalPages > 1 ? (
    <button type="button" onClick={() => onPageChange(currentPage + 1)}>
      page {currentPage} / {totalPages}
    </button>
  ) : null,
}))

const { default: AuthorPage } = await import('./AuthorPage')
const { useAuthorPageStore } = await import('../stores/authorPageStore')
const { api } = await import('../utils/api')
const mockedGet = vi.mocked(api.get)

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

function createResponse(page: number, hasMore: boolean) {
  return {
    author: { id: 'author-1', name: 'Author' },
    novels: [createNovel(String(page))],
    page,
    nextPage: hasMore ? page + 1 : null,
    hasMore,
  }
}

function LocationProbe() {
  const location = useLocation()
  return <span data-testid="location">{location.pathname}{location.search}</span>
}

function renderAuthorPage(path = '/author/author-1') {
  return renderReactElement(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/author/:id"
          element={(
            <>
              <AuthorPage />
              <LocationProbe />
            </>
          )}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AuthorPage', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    mockedGet.mockReset()
    useAuthorPageStore.setState(createEmptyAuthorPageCache())
  })

  it('renders a fresh cached page after refresh without requesting it again', async () => {
    useAuthorPageStore.getState().cachePage('author-1', createResponse(2, true))

    const rendered: ReturnType<typeof renderAuthorPage>[] = []
    await act(async () => {
      rendered.push(renderAuthorPage('/author/author-1?page=2'))
      await Promise.resolve()
    })

    expect(rendered[0].container.textContent).toContain('Novel 2')
    expect(rendered[0].container.textContent).toContain('page 2 / 3')
    expect(rendered[0].container.textContent).not.toContain('加载更多')
    expect(mockedGet).not.toHaveBeenCalled()

    rendered[0].unmount()
  })

  it('writes page navigation to the URL and reuses that page from cache on refresh', async () => {
    mockedGet
      .mockResolvedValueOnce(createResponse(1, true))
      .mockResolvedValueOnce(createResponse(2, false))

    const firstRender = renderAuthorPage()
    await act(async () => {
      await Promise.resolve()
    })

    expect(firstRender.container.textContent).toContain('Novel 1')
    await act(async () => {
      clickButtonContainingText(firstRender.container, 'page 1 / 2')
      await Promise.resolve()
    })

    expect(firstRender.container.textContent).toContain('Novel 2')
    expect(firstRender.container.textContent).toContain('/author/author-1?page=2')
    expect(mockedGet).toHaveBeenNthCalledWith(2, '/novels/user/author-1', { page: 2 })
    firstRender.unmount()

    mockedGet.mockClear()
    const refreshed = renderAuthorPage('/author/author-1?page=2')
    await act(async () => {
      await Promise.resolve()
    })

    expect(refreshed.container.textContent).toContain('Novel 2')
    expect(mockedGet).not.toHaveBeenCalled()
    refreshed.unmount()
  })
})
