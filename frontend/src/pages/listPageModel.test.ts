import { describe, expect, it } from 'vitest'
import {
  buildBookmarkListDocumentTitle,
  buildBookmarkListViewModel,
  buildBookmarkListRequestParams,
  calculateBookmarkListTotalPages,
  getBookmarkListLoadErrorMessage,
} from './listPageModel'

describe('listPageModel', () => {
  it('builds bookmark list request params from page and limit', () => {
    expect(buildBookmarkListRequestParams({ page: 3, limit: 20 })).toEqual({
      page: 3,
      limit: 20,
    })
  })

  it('builds the bookmark list document title from the localized default', () => {
    expect(buildBookmarkListDocumentTitle('书签 - Pixvel')).toBe('书签 - Pixvel')
  })

  it('calculates bookmark list total pages from total and limit', () => {
    expect(calculateBookmarkListTotalPages({ total: 0, limit: 20 })).toBe(0)
    expect(calculateBookmarkListTotalPages({ total: 1, limit: 20 })).toBe(1)
    expect(calculateBookmarkListTotalPages({ total: 40, limit: 20 })).toBe(2)
    expect(calculateBookmarkListTotalPages({ total: 41, limit: 20 })).toBe(3)
  })

  it('uses Error messages before falling back to the localized load message', () => {
    expect(getBookmarkListLoadErrorMessage(new Error('ERR_BOOKMARKS_FAILED'), 'fallback')).toBe('ERR_BOOKMARKS_FAILED')
    expect(getBookmarkListLoadErrorMessage('bad response', 'fallback')).toBe('fallback')
  })

  it('builds list page view state from loading, novels, and totals', () => {
    const formatTotalLabel = (count: number) => `Total ${count}`

    expect(buildBookmarkListViewModel({
      isLoading: true,
      novelCount: 0,
      total: 0,
      limit: 20,
      formatTotalLabel,
    })).toEqual({
      state: 'loading',
      totalPages: 0,
      showPagination: false,
      totalLabel: 'Total 0',
      emptyActionPath: '/search',
    })

    expect(buildBookmarkListViewModel({
      isLoading: false,
      novelCount: 3,
      total: 41,
      limit: 20,
      formatTotalLabel,
    })).toEqual({
      state: 'results',
      totalPages: 3,
      showPagination: true,
      totalLabel: 'Total 41',
      emptyActionPath: '/search',
    })

    expect(buildBookmarkListViewModel({
      isLoading: false,
      novelCount: 0,
      total: 0,
      limit: 20,
      formatTotalLabel,
    })).toEqual({
      state: 'empty',
      totalPages: 0,
      showPagination: false,
      totalLabel: 'Total 0',
      emptyActionPath: '/search',
    })
  })
})
