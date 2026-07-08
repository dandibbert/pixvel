import { describe, expect, it } from 'vitest'
import {
  buildReaderPageSearchParams,
  resolveNextReaderPage,
  resolvePreviousReaderPage,
  resolveReaderPageFromSearchParams,
  resolveRequestedReaderPage,
} from './novelPaginationModel'

describe('novelPaginationModel', () => {
  it('resolves valid URL page params within the loaded page range', () => {
    expect(resolveReaderPageFromSearchParams(new URLSearchParams('page=3'), 5)).toBe(3)
    expect(resolveReaderPageFromSearchParams(new URLSearchParams('page=6'), 5)).toBeNull()
    expect(resolveReaderPageFromSearchParams(new URLSearchParams(''), 5)).toBeNull()
  })

  it('resolves direct, next, and previous page navigation within bounds', () => {
    expect(resolveRequestedReaderPage(2, 5)).toBe(2)
    expect(resolveRequestedReaderPage(0, 5)).toBeNull()
    expect(resolveRequestedReaderPage(6, 5)).toBeNull()

    expect(resolveNextReaderPage(2, 5)).toBe(3)
    expect(resolveNextReaderPage(5, 5)).toBeNull()

    expect(resolvePreviousReaderPage(2)).toBe(1)
    expect(resolvePreviousReaderPage(1)).toBeNull()
  })

  it('builds the reader page URL payload used by router search params', () => {
    expect(buildReaderPageSearchParams(4)).toEqual({ page: '4' })
  })
})
