import { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import NovelReader from './NovelReader'
import type { NovelDetail, NovelPage } from '../../types/novel'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const mockDownloadNovelTxt = vi.fn()
const mockRefreshNovel = vi.fn()
const mockGoToPage = vi.fn()
const mockGoToNextPage = vi.fn()
const mockGoToPrevPage = vi.fn()

const novel: NovelDetail = {
  id: 'novel-1',
  title: 'Test Novel',
  description: 'Test description',
  author: {
    id: 'author-1',
    name: 'Author Name',
  },
  tags: ['tag1'],
  pageCount: 2,
  textLength: 1200,
  totalBookmarks: 34,
  totalViews: 56,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  content: 'Page 1\n\nPage 2',
  pages: [
    {
      page: 1,
      content: 'Page 1',
    },
    {
      page: 2,
      content: 'Page 2',
    },
  ],
}

const pages: NovelPage[] = [
  {
    page: 1,
    content: 'Page 1',
  },
  {
    page: 2,
    content: 'Page 2',
  },
]

let mockPages = pages

vi.mock('../../utils/novelDownload', () => ({
  downloadNovelTxt: (...args: unknown[]) => mockDownloadNovelTxt(...args),
}))

vi.mock('../../stores/readerStore', () => ({
  useReaderStore: (selector?: (state: unknown) => unknown) => {
    const state = {
      novel,
      pages: mockPages,
      refreshNovel: mockRefreshNovel,
    }

    return selector ? selector(state) : state
  },
}))

vi.mock('../../hooks/useNovelPagination', () => ({
  useNovelPagination: () => ({
    currentPage: 1,
    totalPages: mockPages.length,
    goToPage: mockGoToPage,
    goToNextPage: mockGoToNextPage,
    goToPrevPage: mockGoToPrevPage,
  }),
}))

vi.mock('../../i18n/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      if (key === 'reader.downloadTxt') {
        return 'Download TXT'
      }

      if (key === 'reader.downloadFailed') {
        return 'Download failed'
      }

      return key
    },
  }),
}))

vi.mock('./NovelContent', () => ({
  default: ({ content }: { content: string }) => <div data-testid="novel-content">{content}</div>,
}))

vi.mock('./NovelPageNav', () => ({
  default: () => <div data-testid="novel-page-nav" />,
}))

vi.mock('./NovelSeriesNav', () => ({
  default: () => <div data-testid="novel-series-nav" />,
}))

vi.mock('./NovelDetailModal', () => ({
  default: () => <div data-testid="novel-detail-modal" />,
}))

function renderNovelReader() {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const root = createRoot(container)

  act(() => {
    root.render(
      <MemoryRouter>
        <NovelReader series={null} />
      </MemoryRouter>
    )
  })

  return { container, root }
}

function getDownloadButton(container: HTMLElement): HTMLButtonElement {
  const button = container.querySelector('button[aria-label="Download TXT"]')

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error('Download button was not found')
  }

  return button
}

function unmount(root: Root, container: HTMLElement) {
  act(() => {
    root.unmount()
  })
  container.remove()
}

describe('NovelReader', () => {
  beforeEach(() => {
    mockPages = pages
    mockDownloadNovelTxt.mockReset()
    mockRefreshNovel.mockReset()
    mockGoToPage.mockReset()
    mockGoToNextPage.mockReset()
    mockGoToPrevPage.mockReset()
    document.body.innerHTML = ''
  })

  it('clicking the download button calls downloadNovelTxt with the loaded novel and parsed pages', () => {
    const { container, root } = renderNovelReader()

    act(() => {
      getDownloadButton(container).click()
    })

    expect(mockDownloadNovelTxt).toHaveBeenCalledWith(novel, pages)

    unmount(root, container)
  })

  it('disables the download button when parsed pages are empty', () => {
    mockPages = []

    const { container, root } = renderNovelReader()

    expect(getDownloadButton(container).disabled).toBe(true)

    unmount(root, container)
  })

  it('shows the lightweight failure message when downloadNovelTxt throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockDownloadNovelTxt.mockImplementation(() => {
      throw new Error('download failed')
    })

    const { container, root } = renderNovelReader()

    act(() => {
      getDownloadButton(container).click()
    })

    expect(container.textContent).toContain('Download failed')
    expect(consoleError).toHaveBeenCalledWith('Download novel error:', expect.any(Error))

    consoleError.mockRestore()
    unmount(root, container)
  })

  it('clears the failure message after a later successful download', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockDownloadNovelTxt
      .mockImplementationOnce(() => {
        throw new Error('download failed')
      })
      .mockImplementationOnce(() => undefined)

    const { container, root } = renderNovelReader()

    act(() => {
      getDownloadButton(container).click()
    })

    expect(container.textContent).toContain('Download failed')

    act(() => {
      getDownloadButton(container).click()
    })

    expect(container.textContent).not.toContain('Download failed')

    consoleError.mockRestore()
    unmount(root, container)
  })
})
