import { describe, expect, it } from 'vitest'
import {
  buildHighlightWords,
  normalizeHighlightKeyword,
  splitHighlightedText,
} from './textHighlight'

describe('textHighlight', () => {
  it('normalizes highlight words by trimming, deduping case-insensitively, and sorting longest first', () => {
    expect(
      buildHighlightWords([
        '  alpha ',
        'ALPHA',
        '',
        'alphabet',
        ' beta ',
      ]),
    ).toEqual(['alphabet', 'alpha', 'beta'])
  })

  it('drops overly long terms and caps the highlight list', () => {
    const words = Array.from({ length: 25 }, (_, index) => `word-${index}`)
    words.splice(2, 0, 'x'.repeat(65))

    expect(buildHighlightWords(words)).toEqual(
      [
        ...Array.from({ length: 10 }, (_, index) => `word-${index + 10}`),
        ...Array.from({ length: 10 }, (_, index) => `word-${index}`),
      ],
    )
  })

  it('splits text into highlighted and plain segments while preserving original casing', () => {
    expect(splitHighlightedText('Alphabet soup and alpha', ['alpha', 'alphabet'])).toEqual([
      { text: 'Alphabet', isHighlighted: true },
      { text: ' soup and ', isHighlighted: false },
      { text: 'alpha', isHighlighted: true },
    ])
  })

  it('returns a single plain segment when no highlights match', () => {
    expect(splitHighlightedText('plain text', ['missing'])).toEqual([
      { text: 'plain text', isHighlighted: false },
    ])
    expect(splitHighlightedText('', ['missing'])).toEqual([])
    expect(splitHighlightedText('plain text', [])).toEqual([
      { text: 'plain text', isHighlighted: false },
    ])
  })

  it('normalizes lookup keywords with trimmed lowercase text', () => {
    expect(normalizeHighlightKeyword('  TAG  ')).toBe('tag')
  })
})
