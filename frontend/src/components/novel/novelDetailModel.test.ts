import { describe, expect, it } from 'vitest'
import {
  appendRelTokens,
  buildNovelDetailContentViewModel,
  extractPixivNovelId,
  formatNovelCreatedDate,
  getFirstChar,
  normalizeDescriptionLinks,
} from './novelDetailModel'

describe('novelDetailModel', () => {
  it('appends link rel tokens while preserving existing token order', () => {
    expect(appendRelTokens('ugc noopener', ['noopener', 'noreferrer'])).toBe('ugc noopener noreferrer')
    expect(appendRelTokens('', ['noopener', 'noreferrer'])).toBe('noopener noreferrer')
  })

  it('extracts numeric Pixiv novel ids from supported in-description link formats', () => {
    expect(extractPixivNovelId('novel/123456')).toBe('123456')
    expect(extractPixivNovelId('pixiv://novels/22208150')).toBe('22208150')
    expect(extractPixivNovelId('https://www.pixiv.net/novel/show.php?id=123456')).toBe('123456')
    expect(extractPixivNovelId('https://www.pixiv.net/en/novel/123456')).toBe('123456')
  })

  it('rejects non-Pixiv, lookalike, and non-numeric novel links', () => {
    expect(extractPixivNovelId(null)).toBeNull()
    expect(extractPixivNovelId('https://evilpixiv.net/novel/123456')).toBeNull()
    expect(extractPixivNovelId('https://www.pixiv.net/novel/show.php?id=123abc')).toBeNull()
    expect(extractPixivNovelId('https://example.com/novel/123456')).toBeNull()
  })

  it('rewrites Pixiv novel links in descriptions and protects blank-target links', () => {
    const normalized = normalizeDescriptionLinks(
      '<a href="novel/123456">next</a><a href="https://example.com" target="_blank" rel="ugc">external</a>',
    )

    expect(normalized).toContain('href="/novel/123456"')
    expect(normalized).toContain('target="_blank"')
    expect(normalized).toContain('rel="noopener noreferrer"')
    expect(normalized).toContain('rel="ugc noopener noreferrer"')
  })

  it('keeps empty description HTML unchanged', () => {
    expect(normalizeDescriptionLinks('')).toBe('')
  })

  it('handles surrogate-pair initials', () => {
    expect(getFirstChar('📘Novel')).toBe('📘')
    expect(getFirstChar('Novel')).toBe('N')
  })

  it('formats created dates with the active locale', () => {
    expect(formatNovelCreatedDate('2024-01-02T00:00:00.000Z', 'zh')).toBe('2024/1/2')
    expect(formatNovelCreatedDate('2024-01-02T00:00:00.000Z', 'ja')).toBe('2024/1/2')
  })

  it('builds detail content view state with display defaults', () => {
    expect(
      buildNovelDetailContentViewModel({
        novel: {
          series: {
            id: 'series-1',
            title: 'Series',
          },
        },
        statsMode: 'reader',
      }),
    ).toEqual({
      hasSeries: true,
      tags: [],
      totalBookmarks: 0,
      totalViews: 0,
      textLength: 0,
      descriptionClassName: 'text-foreground/70 leading-relaxed text-sm md:text-base bg-muted/30 p-4 md:p-6 rounded-lg whitespace-pre-wrap break-words overflow-wrap-anywhere',
    })
  })

  it('hides incomplete series metadata in the detail content view state', () => {
    expect(
      buildNovelDetailContentViewModel({
        novel: {
          tags: ['tag'],
          totalBookmarks: 10,
          totalViews: 20,
          textLength: 30,
          series: {
            id: 'series-1',
            title: '',
          },
        },
        statsMode: 'preview',
      }),
    ).toEqual({
      hasSeries: false,
      tags: ['tag'],
      totalBookmarks: 10,
      totalViews: 20,
      textLength: 30,
      descriptionClassName: 'text-foreground/70 leading-relaxed text-sm md:text-base bg-muted/30 p-4 md:p-6 rounded-lg break-words overflow-wrap-anywhere',
    })
  })
})
