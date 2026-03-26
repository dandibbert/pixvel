import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildNovelTxtContent, buildNovelTxtFilename, downloadNovelTxt } from './novelDownload'
import type { NovelPage, Novel } from '../types/novel'

function createNovel(overrides: Partial<Novel> = {}): Novel {
  return {
    id: 'novel-1',
    title: '小説タイトル',
    description: 'description',
    author: {
      id: 'author-1',
      name: '作者名',
    },
    tags: [],
    pageCount: 2,
    textLength: 100,
    totalBookmarks: 0,
    totalViews: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function createPage(page: number, content: string): NovelPage {
  return {
    page,
    content,
  }
}

describe('novelDownload', () => {
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL

  beforeEach(() => {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  it('joins two pages with one blank line', () => {
    const pages = [
      createPage(1, '第一ページ'),
      createPage(2, '第二ページ'),
    ]

    expect(buildNovelTxtContent(pages)).toBe('第一ページ\n\n第二ページ')
  })

  it('preserves an empty page between non-empty pages', () => {
    const pages = [
      createPage(1, '第一ページ'),
      createPage(2, ''),
      createPage(3, '第三ページ'),
    ]

    expect(buildNovelTxtContent(pages)).toBe('第一ページ\n\n\n\n第三ページ')
  })

  it('builds filename with author title and series', () => {
    const novel = createNovel({
      series: {
        id: 'series-1',
        title: 'シリーズ名',
      },
    })

    expect(buildNovelTxtFilename(novel)).toBe('作者名-小説タイトル-シリーズ名.txt')
  })

  it('omits series segment when no series', () => {
    const novel = createNovel()

    expect(buildNovelTxtFilename(novel)).toBe('作者名-小説タイトル.txt')
  })

  it('sanitizes illegal filename characters before joining segments', () => {
    const novel = createNovel({
      title: '小説/タイトル',
      author: {
        id: 'author-1',
        name: '作:者',
      },
      series: {
        id: 'series-1',
        title: '系*列?名',
      },
    })

    expect(buildNovelTxtFilename(novel)).toBe('作_者-小説_タイトル-系_列_名.txt')
  })

  it('clicks the generated download link and cleans up after success', () => {
    const createObjectURL = vi.fn(() => 'blob:novel')
    const revokeObjectURL = vi.fn()
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL

    const novel = createNovel()
    const pages = [createPage(1, '本文')]

    downloadNovelTxt(novel, pages)

    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(document.body.querySelector('a')).toBeNull()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:novel')
  })

  it('removes the link and revokes the object URL when click throws', () => {
    const createObjectURL = vi.fn(() => 'blob:novel')
    const revokeObjectURL = vi.fn()

    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {
        throw new Error('click failed')
      })

    const novel = createNovel()
    const pages = [createPage(1, '本文')]

    expect(() => downloadNovelTxt(novel, pages)).toThrow('click failed')
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(document.body.querySelector('a')).toBeNull()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:novel')
  })

  it('throws when all pages are empty without creating a download', () => {
    const createObjectURL = vi.fn(() => 'blob:novel')
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    URL.createObjectURL = createObjectURL

    const novel = createNovel()
    const pages = [createPage(1, ''), createPage(2, ''), createPage(3, '')]

    expect(() => downloadNovelTxt(novel, pages)).toThrow('ERR_EMPTY_NOVEL_DOWNLOAD')
    expect(clickSpy).not.toHaveBeenCalled()
    expect(createObjectURL).not.toHaveBeenCalled()
    expect(document.body.querySelector('a')).toBeNull()
  })

  it('throws when all pages contain only whitespace without creating a download', () => {
    const createObjectURL = vi.fn(() => 'blob:novel')
    const revokeObjectURL = vi.fn()
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL

    const novel = createNovel()
    const pages = [createPage(1, '   '), createPage(2, '\n'), createPage(3, '\t')]

    expect(() => downloadNovelTxt(novel, pages)).toThrow('ERR_EMPTY_NOVEL_DOWNLOAD')
    expect(clickSpy).not.toHaveBeenCalled()
    expect(createObjectURL).not.toHaveBeenCalled()
    expect(revokeObjectURL).not.toHaveBeenCalled()
    expect(document.body.querySelector('a')).toBeNull()
  })
})
