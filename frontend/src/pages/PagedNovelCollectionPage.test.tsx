import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clickButtonContainingText,
  getButtonContainingText,
  renderReactElement,
} from '../test/domTestUtils'
import type { Novel } from '../types/novel'

type MockNovelGridProps = {
  novels: Novel[]
  onNovelClick: (novel: Novel) => void
}

const mockNovelGridProps: MockNovelGridProps[] = []

vi.mock('../components/novel/NovelGrid', () => ({
  default: (props: MockNovelGridProps) => {
    mockNovelGridProps.push(props)

    return (
      <button type="button" onClick={() => props.onNovelClick(props.novels[0])}>
        novel grid
      </button>
    )
  },
}))

const { default: PagedNovelCollectionPage } = await import('./PagedNovelCollectionPage')

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

function renderPagedNovelCollectionPage(
  props: Partial<React.ComponentProps<typeof PagedNovelCollectionPage>> = {},
) {
  const onNovelClick = vi.fn()
  const onLoadMore = vi.fn()
  const novels = [createNovel('first')]

  return {
    ...renderReactElement(
      <PagedNovelCollectionPage
        label="作者"
        title="Author Name"
        subtitle="1 works"
        error={null}
        novels={novels}
        isLoading={false}
        hasMore={true}
        loadingLabel="加载中"
        loadMoreLabel="加载更多"
        emptyLabel="暂无作品"
        onNovelClick={onNovelClick}
        onLoadMore={onLoadMore}
        {...props}
      />,
    ),
    onNovelClick,
    onLoadMore,
    novels,
  }
}

describe('PagedNovelCollectionPage', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    mockNovelGridProps.length = 0
  })

  it('renders collection chrome and forwards list interactions', () => {
    const { container, unmount, novels, onNovelClick, onLoadMore } = renderPagedNovelCollectionPage()

    expect(container.textContent).toContain('作者')
    expect(container.textContent).toContain('Author Name')
    expect(container.textContent).toContain('1 works')
    expect(mockNovelGridProps[0].novels).toEqual(novels)

    clickButtonContainingText(container, 'novel grid')
    clickButtonContainingText(container, '加载更多')

    expect(onNovelClick).toHaveBeenCalledWith(novels[0])
    expect(onLoadMore).toHaveBeenCalledOnce()

    unmount()
  })

  it('shows the initial loading state before any novels are loaded', () => {
    const { container, unmount } = renderPagedNovelCollectionPage({
      novels: [],
      isLoading: true,
      hasMore: false,
    })

    expect(container.textContent).toContain('加载中')
    expect(mockNovelGridProps).toHaveLength(0)

    unmount()
  })

  it('shows errors and disables load more while loading additional pages', () => {
    const { container, unmount } = renderPagedNovelCollectionPage({
      error: '加载失败',
      isLoading: true,
    })

    const loadMoreButton = getButtonContainingText(container, '加载中')

    expect(container.textContent).toContain('加载失败')
    expect(loadMoreButton.disabled).toBe(true)

    unmount()
  })

  it('shows the empty state when no novels are available', () => {
    const { container, unmount } = renderPagedNovelCollectionPage({
      novels: [],
      hasMore: false,
    })

    expect(container.textContent).toContain('暂无作品')
    expect(mockNovelGridProps).toHaveLength(0)

    unmount()
  })
})
