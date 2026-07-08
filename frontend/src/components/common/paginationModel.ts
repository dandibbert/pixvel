export type PaginationPageItem = number | '...'

interface BuildVisiblePageItemsOptions {
  currentPage: number
  totalPages: number
}

const MAX_VISIBLE_PAGES = 5

export function buildVisiblePageItems({
  currentPage,
  totalPages,
}: BuildVisiblePageItemsOptions): PaginationPageItem[] {
  const pages: PaginationPageItem[] = []

  if (totalPages <= MAX_VISIBLE_PAGES) {
    for (let page = 1; page <= totalPages; page++) {
      pages.push(page)
    }
    return pages
  }

  if (currentPage <= 3) {
    for (let page = 1; page <= 4; page++) {
      pages.push(page)
    }
    pages.push('...', totalPages)
    return pages
  }

  if (currentPage >= totalPages - 2) {
    pages.push(1, '...')
    for (let page = totalPages - 3; page <= totalPages; page++) {
      pages.push(page)
    }
    return pages
  }

  return [1, '...', currentPage, '...', totalPages]
}
