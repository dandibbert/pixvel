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

function renderNovelDetailModal(onClose: () => void) {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const root = createRoot(container)

  act(() => {
    root.render(<NovelDetailModal novel={novel} isOpen={true} onClose={onClose} />)
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
})
