interface NovelPageNavStateInput {
  currentPage: number
  totalPages: number
  hasPrevSeries: boolean
  hasNextSeries: boolean
}

export function resolveNovelPageNavState({
  currentPage,
  totalPages,
  hasPrevSeries,
  hasNextSeries,
}: NovelPageNavStateInput) {
  const isOnFirstPage = currentPage === 1
  const isOnLastPage = currentPage === totalPages
  const canJumpPrevSeries = isOnFirstPage && hasPrevSeries
  const canJumpNextSeries = isOnLastPage && hasNextSeries

  return {
    isOnFirstPage,
    isOnLastPage,
    canJumpPrevSeries,
    canJumpNextSeries,
    isPrevDisabled: isOnFirstPage && !hasPrevSeries,
    isNextDisabled: isOnLastPage && !hasNextSeries,
  }
}
