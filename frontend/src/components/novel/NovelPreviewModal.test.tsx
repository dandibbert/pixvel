import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clickButtonContainingText,
  getButtonContainingText,
  renderReactElement,
} from '../../test/domTestUtils'
import NovelPreviewModal from './NovelPreviewModal'
import { Novel } from '../../types/novel'

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockOpen = vi.spyOn(window, 'open').mockImplementation(() => null)

const novel: Novel = {
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
  series: {
    id: 'series-1',
    title: 'Series Title',
  },
}

function renderNovelPreviewModal(onClose: () => void) {
  return renderReactElement(<NovelPreviewModal novel={novel} isOpen={true} onClose={onClose} />)
}

describe('NovelPreviewModal', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockOpen.mockReset()
    mockOpen.mockImplementation(() => null)
    vi.useRealTimers()
  })

  it('opens the author page in a new tab and closes the modal when author name is clicked', () => {
    const onClose = vi.fn()
    const { container, unmount } = renderNovelPreviewModal(onClose)

    clickButtonContainingText(container, 'Author Name')

    expect(mockOpen).toHaveBeenCalledWith('/author/author-1', '_blank', 'noopener,noreferrer')
    expect(onClose).toHaveBeenCalledTimes(1)

    unmount()
  })

  it('opens the author page in a new tab and closes the modal when author avatar is clicked', () => {
    const onClose = vi.fn()
    const { container, unmount } = renderNovelPreviewModal(onClose)

    clickButtonContainingText(container, 'A')

    expect(mockOpen).toHaveBeenCalledWith('/author/author-1', '_blank', 'noopener,noreferrer')
    expect(onClose).toHaveBeenCalledTimes(1)

    unmount()
  })

  it('opens the series page in a new tab and closes the modal when series is clicked', () => {
    const onClose = vi.fn()
    const { container, unmount } = renderNovelPreviewModal(onClose)

    clickButtonContainingText(container, '系列')

    expect(mockOpen).toHaveBeenCalledWith('/series/series-1', '_blank', 'noopener,noreferrer')
    expect(onClose).toHaveBeenCalledTimes(1)

    unmount()
  })

  it('keeps the current-tab long-press menu action navigating in the current tab', () => {
    vi.useFakeTimers()

    const onClose = vi.fn()
    const { container, unmount } = renderNovelPreviewModal(onClose)
    const readNowButton = getButtonContainingText(container, '立即阅读')

    act(() => {
      readNowButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 120, clientY: 140 }))
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    clickButtonContainingText(container, '当前标签页打开')

    expect(mockNavigate).toHaveBeenCalledWith('/novel/novel-1')
    expect(mockOpen).not.toHaveBeenCalled()

    unmount()
    vi.useRealTimers()
  })
})
