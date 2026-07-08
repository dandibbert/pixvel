import { normalizeComparableText } from './textNormalize'

const MAX_HIGHLIGHT_TERMS = 20
const MAX_HIGHLIGHT_TERM_LENGTH = 64

export interface HighlightTextSegment {
  text: string
  isHighlighted: boolean
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function normalizeHighlightKeyword(value: string): string {
  return normalizeComparableText(value)
}

export function buildHighlightWords(words: ReadonlyArray<string>): string[] {
  const seen = new Set<string>()
  const deduped: string[] = []

  for (const word of words) {
    const trimmed = word.trim()
    if (trimmed.length === 0) continue
    if (trimmed.length > MAX_HIGHLIGHT_TERM_LENGTH) continue

    const normalized = normalizeHighlightKeyword(trimmed)
    if (seen.has(normalized)) continue

    seen.add(normalized)
    deduped.push(trimmed)

    if (deduped.length >= MAX_HIGHLIGHT_TERMS) {
      break
    }
  }

  return deduped.sort((a, b) => b.length - a.length)
}

export function splitHighlightedText(
  text: string,
  highlightWords: ReadonlyArray<string>,
): HighlightTextSegment[] {
  if (!text) return []

  const normalizedHighlightWords = buildHighlightWords(highlightWords)
  if (normalizedHighlightWords.length === 0) {
    return [{ text, isHighlighted: false }]
  }

  const highlightLookup = new Set(normalizedHighlightWords.map((word) => normalizeHighlightKeyword(word)))
  const highlightPattern = new RegExp(
    `(${normalizedHighlightWords.map(escapeRegExp).join('|')})`,
    'gi',
  )

  return text
    .split(highlightPattern)
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      isHighlighted: highlightLookup.has(normalizeHighlightKeyword(part)),
    }))
}
