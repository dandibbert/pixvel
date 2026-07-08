import type { NovelSeries } from '../../hooks/useNovelDetail'

export type ReaderNavigationDirection = 'prev' | 'next'

type ReaderNavigationAction =
  | { type: 'series'; novelId: string }
  | { type: 'page' }
  | { type: 'none' }

interface ReaderNavigationInput {
  direction: ReaderNavigationDirection
  currentPage: number
  totalPages: number
  series: NovelSeries | null
}

export function resolveReaderNavigationAction({
  direction,
  currentPage,
  totalPages,
  series,
}: ReaderNavigationInput): ReaderNavigationAction {
  if (direction === 'prev') {
    if (currentPage === 1) {
      if (series?.prev_novel) {
        return { type: 'series', novelId: series.prev_novel.id }
      }

      return { type: 'none' }
    }

    return { type: 'page' }
  }

  const isOnLastPage = totalPages > 0 ? currentPage === totalPages : true

  if (isOnLastPage) {
    if (series?.next_novel) {
      return { type: 'series', novelId: series.next_novel.id }
    }

    return { type: 'none' }
  }

  return { type: 'page' }
}
