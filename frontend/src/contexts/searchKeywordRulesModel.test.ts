import { describe, expect, it } from 'vitest'
import {
  BLOCKED_WORDS_STORAGE_KEY,
  HIGHLIGHT_WORDS_STORAGE_KEY,
  parseKeywordInput,
} from './searchKeywordRulesModel'

describe('searchKeywordRulesModel', () => {
  it('keeps keyword rule storage keys reusable outside the provider', () => {
    expect(BLOCKED_WORDS_STORAGE_KEY).toBe('search-keyword-rules-blocked-words')
    expect(HIGHLIGHT_WORDS_STORAGE_KEY).toBe('search-keyword-rules-highlight-words')
  })

  it('parses comma-separated keyword input into unique trimmed words', () => {
    expect(parseKeywordInput(' ネタバレ,地雷, ネタバレ ,, 甘い ')).toEqual([
      'ネタバレ',
      '地雷',
      '甘い',
    ])
  })
})
