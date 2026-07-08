import { compactTrimmedStrings } from '../utils/stringList'

export const BLOCKED_WORDS_STORAGE_KEY = 'search-keyword-rules-blocked-words'
export const HIGHLIGHT_WORDS_STORAGE_KEY = 'search-keyword-rules-highlight-words'

export function parseKeywordInput(input: string): string[] {
  return Array.from(new Set(compactTrimmedStrings(input.split(','))))
}
