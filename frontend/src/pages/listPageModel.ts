import { getErrorMessage } from '../utils/errorLog'

interface BookmarkListRequestInput {
  page: number
  limit: number
}

interface BookmarkListTotalPagesInput {
  total: number
  limit: number
}

interface BookmarkListViewModelInput {
  isLoading: boolean
  novelCount: number
  total: number
  limit: number
  formatTotalLabel: (total: number) => string
}

type BookmarkListViewState = 'loading' | 'results' | 'empty'

const BOOKMARK_LIST_EMPTY_ACTION_PATH = '/search'

export function buildBookmarkListRequestParams({ page, limit }: BookmarkListRequestInput) {
  return { page, limit }
}

export function buildBookmarkListDocumentTitle(defaultTitle: string) {
  return defaultTitle
}

export function calculateBookmarkListTotalPages({ total, limit }: BookmarkListTotalPagesInput) {
  return Math.ceil(total / limit)
}

export function getBookmarkListLoadErrorMessage(error: unknown, fallbackMessage: string) {
  return getErrorMessage(error, fallbackMessage)
}

export function buildBookmarkListViewModel({
  isLoading,
  novelCount,
  total,
  limit,
  formatTotalLabel,
}: BookmarkListViewModelInput) {
  const totalPages = calculateBookmarkListTotalPages({ total, limit })
  const state: BookmarkListViewState = isLoading
    ? 'loading'
    : novelCount > 0
      ? 'results'
      : 'empty'

  return {
    state,
    totalPages,
    showPagination: totalPages > 1,
    totalLabel: formatTotalLabel(total),
    emptyActionPath: BOOKMARK_LIST_EMPTY_ACTION_PATH,
  }
}
