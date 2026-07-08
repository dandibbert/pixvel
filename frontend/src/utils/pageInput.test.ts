import { describe, expect, it } from 'vitest'
import { normalizeOptionalPage, parseBoundedPageInput } from './pageInput'

describe('parseBoundedPageInput', () => {
  it('returns page numbers within the allowed range', () => {
    expect(parseBoundedPageInput('1', 10)).toBe(1)
    expect(parseBoundedPageInput('10', 10)).toBe(10)
    expect(parseBoundedPageInput(' 3 ', 10)).toBe(3)
  })

  it('returns null for blank, non-numeric, and out-of-range values', () => {
    expect(parseBoundedPageInput('', 10)).toBeNull()
    expect(parseBoundedPageInput('abc', 10)).toBeNull()
    expect(parseBoundedPageInput('0', 10)).toBeNull()
    expect(parseBoundedPageInput('11', 10)).toBeNull()
    expect(parseBoundedPageInput('1', 0)).toBeNull()
  })

  it('preserves existing parseInt semantics for partial numeric values', () => {
    expect(parseBoundedPageInput('2abc', 10)).toBe(2)
    expect(parseBoundedPageInput('1.5', 10)).toBe(1)
  })
})

describe('normalizeOptionalPage', () => {
  it('converts absent page values to null while preserving numeric pages', () => {
    expect(normalizeOptionalPage(undefined)).toBeNull()
    expect(normalizeOptionalPage(null)).toBeNull()
    expect(normalizeOptionalPage(3)).toBe(3)
  })
})
