import { describe, expect, it } from 'vitest'
import { buildVisiblePageItems } from './paginationModel'

describe('paginationModel', () => {
  it('returns every page when the total fits in the visible window', () => {
    expect(buildVisiblePageItems({ currentPage: 1, totalPages: 1 })).toEqual([1])
    expect(buildVisiblePageItems({ currentPage: 3, totalPages: 5 })).toEqual([1, 2, 3, 4, 5])
    expect(buildVisiblePageItems({ currentPage: 1, totalPages: 0 })).toEqual([])
  })

  it('keeps the first four pages visible near the start', () => {
    expect(buildVisiblePageItems({ currentPage: 1, totalPages: 10 })).toEqual([1, 2, 3, 4, '...', 10])
    expect(buildVisiblePageItems({ currentPage: 3, totalPages: 10 })).toEqual([1, 2, 3, 4, '...', 10])
  })

  it('keeps the current page visible between ellipses in the middle', () => {
    expect(buildVisiblePageItems({ currentPage: 5, totalPages: 10 })).toEqual([1, '...', 5, '...', 10])
  })

  it('keeps the last four pages visible near the end', () => {
    expect(buildVisiblePageItems({ currentPage: 8, totalPages: 10 })).toEqual([1, '...', 7, 8, 9, 10])
    expect(buildVisiblePageItems({ currentPage: 10, totalPages: 10 })).toEqual([1, '...', 7, 8, 9, 10])
  })
})
