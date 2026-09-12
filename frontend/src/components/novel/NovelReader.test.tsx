import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clickButtonByLabel, getButtonByLabel, renderReactElement } from '../../test/domTestUtils'
import { enableReactActEnvironment } from '../../test/reactActEnvironment'
import NovelReader from './NovelReader'
import type { NovelDetail, NovelPage } from '../../types/novel'

enableReactActEnvironment()

const mockDownloadNovelTxt = vi.fn()
const mockRefreshNovel = vi.fn()
const mockGoToPage = vi.fn()
const mockGoToNextPage = vi.fn()
const mockGoToPrevPage = vi.fn()
const mockLogErrorDescriptor = vi.fn()

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

vi.mock('../../utils/errorLog', () => ({
  logErrorDescriptor: (...args: unknown[]) => mockLogErrorDescriptor(...args),
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

vi.mock('../../hooks/useReadingProgress', () => ({
  useReadingProgress: () => undefined,
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
  return renderReactElement(<NovelReader series={null} />, {
    wrapper: (children) => <MemoryRouter>{children}</MemoryRouter>,
  })
}

describe('NovelReader', () => {
  beforeEach(() => {
    mockPages = pages
    mockDownloadNovelTxt.mockReset()
    mockRefreshNovel.mockReset()
    mockGoToPage.mockReset()
    mockGoToNextPage.mockReset()
    mockGoToPrevPage.mockReset()
    mockLogErrorDescriptor.mockReset()
    document.body.innerHTML = ''
  })

  it('clicking the download button calls downloadNovelTxt with the loaded novel and parsed pages', () => {
    const { container, unmount } = renderNovelReader()

    clickButtonByLabel(container, 'Download TXT')

    expect(mockDownloadNovelTxt).toHaveBeenCalledWith(novel, pages)

    unmount()
  })

  it('disables the download button when parsed pages are empty', () => {
    mockPages = []

    const { container, unmount } = renderNovelReader()

    expect(getButtonByLabel(container, 'Download TXT').disabled).toBe(true)

    unmount()
  })

  it('logs through the shared error logger and shows the lightweight failure message when downloadNovelTxt throws', () => {
    mockDownloadNovelTxt.mockImplementation(() => {
      throw new Error('download failed')
    })

    const { container, unmount } = renderNovelReader()

    clickButtonByLabel(container, 'Download TXT')

    expect(container.textContent).toContain('Download failed')
    expect(mockLogErrorDescriptor).toHaveBeenCalledWith({
      label: 'Download novel error:',
      value: expect.any(Error),
    })

    unmount()
  })

  it('clears the failure message after a later successful download', () => {
    mockDownloadNovelTxt
      .mockImplementationOnce(() => {
        throw new Error('download failed')
      })
      .mockImplementationOnce(() => undefined)

    const { container, unmount } = renderNovelReader()

    clickButtonByLabel(container, 'Download TXT')

    expect(container.textContent).toContain('Download failed')

    clickButtonByLabel(container, 'Download TXT')

    expect(container.textContent).not.toContain('Download failed')

    unmount()
  })
})
