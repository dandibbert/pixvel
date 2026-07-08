import type { NovelSeries } from '../../hooks/useNovelDetail'
import { buildNovelPath } from '../../utils/appNavigation'

type SeriesNavItemState =
  | {
    isAvailable: true
    title: string
    path: string
  }
  | {
    isAvailable: false
  }

function buildSeriesNavItemState(novel: NovelSeries['prev_novel']): SeriesNavItemState {
  if (!novel) {
    return {
      isAvailable: false,
    }
  }

  return {
    isAvailable: true,
    title: novel.title,
    path: buildNovelPath(novel.id),
  }
}

export function resolveNovelSeriesNavState(series: NovelSeries | null) {
  const prev = buildSeriesNavItemState(series?.prev_novel)
  const next = buildSeriesNavItemState(series?.next_novel)

  return {
    shouldRender: prev.isAvailable || next.isAvailable,
    title: series?.title ?? '',
    prev,
    next,
  }
}
