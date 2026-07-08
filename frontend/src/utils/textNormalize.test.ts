import { describe, expect, it } from 'vitest'
import { normalizeComparableText } from './textNormalize'

describe('textNormalize', () => {
  it('normalizes comparable text by trimming and lowercasing locale text', () => {
    expect(normalizeComparableText('  TAG  ')).toBe('tag')
  })
})
