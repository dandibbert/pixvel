export function parseBoundedPageInput(value: string | null | undefined, totalPages: number): number | null {
  if (!value || totalPages < 1) {
    return null
  }

  const page = parseInt(value, 10)
  if (Number.isNaN(page) || page < 1 || page > totalPages) {
    return null
  }

  return page
}

export function normalizeOptionalPage(page: number | null | undefined): number | null {
  return page ?? null
}
