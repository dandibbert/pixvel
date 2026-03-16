import { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  const container = document.createElement('div')
  document.body.appendChild(container)

  const root = createRoot(container)

  act(() => {
    root.render(<NovelPreviewModal novel={novel} isOpen={true} onClose={onClose} />)
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

function unmount(root: Root, container: HTMLElement) {
  act(() => {
    root.unmount()
  })
  container.remove()
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
    const { container, root } = renderNovelPreviewModal(onClose)

    act(() => {
      getButtonByText(container, 'Author Name').click()
    })

    expect(mockOpen).toHaveBeenCalledWith('/author/author-1', '_blank', 'noopener,noreferrer')
    expect(onClose).toHaveBeenCalledTimes(1)

    unmount(root, container)
  })

  it('opens the author page in a new tab and closes the modal when author avatar is clicked', () => {
    const onClose = vi.fn()
    const { container, root } = renderNovelPreviewModal(onClose)

    act(() => {
      getButtonByText(container, 'A').click()
    })

    expect(mockOpen).toHaveBeenCalledWith('/author/author-1', '_blank', 'noopener,noreferrer')
    expect(onClose).toHaveBeenCalledTimes(1)

    unmount(root, container)
  })

  it('opens the series page in a new tab and closes the modal when series is clicked', () => {
    const onClose = vi.fn()
    const { container, root } = renderNovelPreviewModal(onClose)

    act(() => {
      getButtonByText(container, '系列').click()
    })

    expect(mockOpen).toHaveBeenCalledWith('/series/series-1', '_blank', 'noopener,noreferrer')
    expect(onClose).toHaveBeenCalledTimes(1)

    unmount(root, container)
  })

  it('keeps the current-tab long-press menu action navigating in the current tab', () => {
    vi.useFakeTimers()

    const onClose = vi.fn()
    const { container, root } = renderNovelPreviewModal(onClose)
    const readNowButton = getButtonByText(container, '立即阅读')

    act(() => {
      readNowButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 120, clientY: 140 }))
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    act(() => {
      getButtonByText(container, '当前标签页打开').click()
    })

    expect(mockNavigate).toHaveBeenCalledWith('/novel/novel-1')
    expect(mockOpen).not.toHaveBeenCalled()

    unmount(root, container)
    vi.useRealTimers()
  })
})
