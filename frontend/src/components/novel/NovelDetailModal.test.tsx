import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clickButtonContainingText, getAnchorByHref, renderReactElement } from '../../test/domTestUtils'
import NovelDetailModal from './NovelDetailModal'
import { NovelDetail } from '../../types/novel'

const mockOpen = vi.spyOn(window, 'open').mockImplementation(() => null)

const novel: NovelDetail = {
  id: 'novel-1',
  title: 'Test Novel',
  description: 'Test description',
  author: {
    id: 'author-1',
    name: 'Author Name',
  },
  tags: ['tag1'],
  pageCount: 1,
  textLength: 1200,
  totalBookmarks: 34,
  totalViews: 56,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  content: 'Novel content',
  pages: [
    {
      page: 1,
      content: 'Novel page content',
    },
  ],
  series: {
    id: 'series-1',
    title: 'Series Title',
  },
}

function renderNovelDetailModal(onClose: () => void, modalNovel: NovelDetail = novel) {
  return renderReactElement(<NovelDetailModal novel={modalNovel} isOpen={true} onClose={onClose} />)
}

describe('NovelDetailModal', () => {
  beforeEach(() => {
    mockOpen.mockReset()
    mockOpen.mockImplementation(() => null)
  })

  it('opens the author page in a new tab and closes the modal when author name is clicked', () => {
    const onClose = vi.fn()
    const { container, unmount } = renderNovelDetailModal(onClose)

    clickButtonContainingText(container, 'Author Name')

    expect(mockOpen).toHaveBeenCalledWith('/author/author-1', '_blank', 'noopener,noreferrer')
    expect(onClose).toHaveBeenCalledTimes(1)

    unmount()
  })

  it('opens the author page in a new tab and closes the modal when author avatar is clicked', () => {
    const onClose = vi.fn()
    const { container, unmount } = renderNovelDetailModal(onClose)

    clickButtonContainingText(container, 'A')

    expect(mockOpen).toHaveBeenCalledWith('/author/author-1', '_blank', 'noopener,noreferrer')
    expect(onClose).toHaveBeenCalledTimes(1)

    unmount()
  })

  it('opens the series page in a new tab and closes the modal when series is clicked', () => {
    const onClose = vi.fn()
    const { container, unmount } = renderNovelDetailModal(onClose)

    clickButtonContainingText(container, '系列')

    expect(mockOpen).toHaveBeenCalledWith('/series/series-1', '_blank', 'noopener,noreferrer')
    expect(onClose).toHaveBeenCalledTimes(1)

    unmount()
  })

  it('rewrites novel/数字 description links to in-app novel routes', () => {
    const onClose = vi.fn()
    const novelWithDescriptionLink: NovelDetail = {
      ...novel,
      description: 'Read <a href="novel/123456">next chapter</a>',
    }
    const { container, unmount } = renderNovelDetailModal(onClose, novelWithDescriptionLink)

    expect(getAnchorByHref(container, '/novel/123456').textContent).toBe('next chapter')

    unmount()
  })

  it('preserves clickable pixiv scheme novel links as in-app routes that open in a new tab', () => {
    const onClose = vi.fn()
    const novelWithPixivSchemeLink: NovelDetail = {
      ...novel,
      description: '<strong><a href="pixiv://novels/22208150">novel/22208150</a></strong>',
    }
    const { container, unmount } = renderNovelDetailModal(onClose, novelWithPixivSchemeLink)
    const descriptionLink = getAnchorByHref(container, '/novel/22208150')

    expect(descriptionLink?.getAttribute('href')).toBe('/novel/22208150')
    expect(descriptionLink?.getAttribute('target')).toBe('_blank')
    expect(descriptionLink?.getAttribute('rel')).toBe('noopener noreferrer')

    unmount()
  })

  it('adds rel protection to existing target blank links in descriptions', () => {
    const onClose = vi.fn()
    const novelWithExternalBlankLink: NovelDetail = {
      ...novel,
      description: '<a href="https://example.com/story" target="_blank">external</a>',
    }
    const { container, unmount } = renderNovelDetailModal(onClose, novelWithExternalBlankLink)
    const descriptionLink = getAnchorByHref(container, 'https://example.com/story')

    expect(descriptionLink?.getAttribute('target')).toBe('_blank')
    expect(descriptionLink?.getAttribute('rel')).toBe('noopener noreferrer')

    unmount()
  })

  it('does not rewrite lookalike pixiv hosts', () => {
    const onClose = vi.fn()
    const novelWithLookalikeHostLink: NovelDetail = {
      ...novel,
      description: '<a href="https://evilpixiv.net/novel/123456">fake</a>',
    }
    const { container, unmount } = renderNovelDetailModal(onClose, novelWithLookalikeHostLink)

    expect(getAnchorByHref(container, 'https://evilpixiv.net/novel/123456').textContent).toBe('fake')

    unmount()
  })

  it('does not rewrite pixiv web links with non-numeric ids', () => {
    const onClose = vi.fn()
    const novelWithInvalidPixivIdLink: NovelDetail = {
      ...novel,
      description: '<a href="https://www.pixiv.net/novel/show.php?id=123abc">invalid</a>',
    }
    const { container, unmount } = renderNovelDetailModal(onClose, novelWithInvalidPixivIdLink)

    expect(getAnchorByHref(container, 'https://www.pixiv.net/novel/show.php?id=123abc').textContent).toBe('invalid')

    unmount()
  })
})
