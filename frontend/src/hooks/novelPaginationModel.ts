import { parseBoundedPageInput } from '../utils/pageInput'

export function resolveReaderPageFromSearchParams(
  searchParams: URLSearchParams,
  totalPages: number,
): number | null {
  return parseBoundedPageInput(searchParams.get('page'), totalPages)
}

export function resolveRequestedReaderPage(page: number, totalPages: number): number | null {
  if (page < 1 || page > totalPages) {
    return null
  }

  return page
}

export function resolveNextReaderPage(currentPage: number, totalPages: number): number | null {
  return currentPage < totalPages ? currentPage + 1 : null
}

export function resolvePreviousReaderPage(currentPage: number): number | null {
  return currentPage > 1 ? currentPage - 1 : null
}

export function buildReaderPageSearchParams(page: number) {
  return { page: page.toString() }
}
