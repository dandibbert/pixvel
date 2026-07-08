import { afterEach, describe, expect, it, vi } from 'vitest'
import { parseNovelText, splitByNewpage } from './novelTextParser'

describe('novelTextParser', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('splits non-empty novel pages and drops blank page fragments', () => {
    expect(splitByNewpage('first[newpage]  [newpage]second')).toEqual(['first', 'second'])
  })

  it('returns a safe empty page for invalid content without logging noise', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(splitByNewpage(undefined as unknown as string)).toEqual([''])
    expect(consoleError).not.toHaveBeenCalled()
  })

  it('parses Pixiv inline markup while preserving surrounding text order', () => {
    expect(
      parseNovelText(
        'Intro[chapter:Chapter 1]Body[[rb:漢字>かんじ]][[jumpuri:next> pixiv://novels/123]][jump:2]End',
      ),
    ).toEqual([
      { type: 'text', content: 'Intro' },
      { type: 'chapter', content: 'Chapter 1' },
      { type: 'text', content: 'Body' },
      { type: 'ruby', content: '', metadata: { rubyBase: '漢字', rubyText: 'かんじ' } },
      {
        type: 'link',
        content: '',
        metadata: { linkText: 'next', linkUrl: 'pixiv://novels/123' },
      },
      { type: 'jump', content: '', metadata: { jumpPage: 2 } },
      { type: 'text', content: 'End' },
    ])
  })

  it('parses Pixiv image markers with the base image id', () => {
    expect(parseNovelText('[pixivimage:12345-6][uploadedimage:98765]')).toEqual([
      { type: 'image', content: '', metadata: { imageId: '12345' } },
      { type: 'image', content: '', metadata: { imageId: '98765' } },
    ])
  })
})
