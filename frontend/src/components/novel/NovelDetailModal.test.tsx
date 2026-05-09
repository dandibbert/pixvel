import { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  const container = document.createElement('div')
  document.body.appendChild(container)

  const root = createRoot(container)

  act(() => {
    root.render(<NovelDetailModal novel={modalNovel} isOpen={true} onClose={onClose} />)
  })

  return { container, root }
}

function getButtonByText(container: HTMLElement, text: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll('button')).find((element) => element.textContent?.includes(text))

  if (!button) {
    throw new Error(`Button containing text "${text}" was not found`)
  }

  return button as HTMLButtonElement
}

function unmount(root: Root) {
  act(() => {
    root.unmount()
  })
}

describe('NovelDetailModal', () => {
  beforeEach(() => {
    mockOpen.mockReset()
    mockOpen.mockImplementation(() => null)
  })

  it('opens the author page in a new tab and closes the modal when author name is clicked', () => {
    const onClose = vi.fn()
    const { container, root } = renderNovelDetailModal(onClose)

    act(() => {
      getButtonByText(container, 'Author Name').click()
    })

    expect(mockOpen).toHaveBeenCalledWith('/author/author-1', '_blank', 'noopener,noreferrer')
    expect(onClose).toHaveBeenCalledTimes(1)

    unmount(root)
  })

  it('opens the author page in a new tab and closes the modal when author avatar is clicked', () => {
    const onClose = vi.fn()
    const { container, root } = renderNovelDetailModal(onClose)

    act(() => {
      getButtonByText(container, 'A').click()
    })

    expect(mockOpen).toHaveBeenCalledWith('/author/author-1', '_blank', 'noopener,noreferrer')
    expect(onClose).toHaveBeenCalledTimes(1)

    unmount(root)
  })

  it('opens the series page in a new tab and closes the modal when series is clicked', () => {
    const onClose = vi.fn()
    const { container, root } = renderNovelDetailModal(onClose)

    act(() => {
      getButtonByText(container, '系列').click()
    })

    expect(mockOpen).toHaveBeenCalledWith('/series/series-1', '_blank', 'noopener,noreferrer')
    expect(onClose).toHaveBeenCalledTimes(1)

    unmount(root)
  })

  it('rewrites novel/数字 description links to in-app novel routes', () => {
    const onClose = vi.fn()
    const novelWithDescriptionLink: NovelDetail = {
      ...novel,
      description: 'Read <a href="novel/123456">next chapter</a>',
    }
    const { container, root } = renderNovelDetailModal(onClose, novelWithDescriptionLink)
    const descriptionLink = container.querySelector('a[href]')

    expect(descriptionLink?.getAttribute('href')).toBe('/novel/123456')

    unmount(root)
  })

  it('preserves clickable pixiv scheme novel links as in-app routes that open in a new tab', () => {
    const onClose = vi.fn()
    const novelWithPixivSchemeLink: NovelDetail = {
      ...novel,
      description: '<strong><a href="pixiv://novels/22208150">novel/22208150</a></strong>',
    }
    const { container, root } = renderNovelDetailModal(onClose, novelWithPixivSchemeLink)
    const descriptionLink = container.querySelector('a')

    expect(descriptionLink?.getAttribute('href')).toBe('/novel/22208150')
    expect(descriptionLink?.getAttribute('target')).toBe('_blank')
    expect(descriptionLink?.getAttribute('rel')).toBe('noopener noreferrer')

    unmount(root)
  })

  it('adds rel protection to existing target blank links in descriptions', () => {
    const onClose = vi.fn()
    const novelWithExternalBlankLink: NovelDetail = {
      ...novel,
      description: '<a href="https://example.com/story" target="_blank">external</a>',
    }
    const { container, root } = renderNovelDetailModal(onClose, novelWithExternalBlankLink)
    const descriptionLink = container.querySelector('a')

    expect(descriptionLink?.getAttribute('target')).toBe('_blank')
    expect(descriptionLink?.getAttribute('rel')).toBe('noopener noreferrer')

    unmount(root)
  })

  it('does not rewrite lookalike pixiv hosts', () => {
    const onClose = vi.fn()
    const novelWithLookalikeHostLink: NovelDetail = {
      ...novel,
      description: '<a href="https://evilpixiv.net/novel/123456">fake</a>',
    }
    const { container, root } = renderNovelDetailModal(onClose, novelWithLookalikeHostLink)
    const descriptionLink = container.querySelector('a')

    expect(descriptionLink?.getAttribute('href')).toBe('https://evilpixiv.net/novel/123456')

    unmount(root)
  })

  it('does not rewrite pixiv web links with non-numeric ids', () => {
    const onClose = vi.fn()
    const novelWithInvalidPixivIdLink: NovelDetail = {
      ...novel,
      description: '<a href="https://www.pixiv.net/novel/show.php?id=123abc">invalid</a>',
    }
    const { container, root } = renderNovelDetailModal(onClose, novelWithInvalidPixivIdLink)
    const descriptionLink = container.querySelector('a')

    expect(descriptionLink?.getAttribute('href')).toBe('https://www.pixiv.net/novel/show.php?id=123abc')

    unmount(root)
  })
})
