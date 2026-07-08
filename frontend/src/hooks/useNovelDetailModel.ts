import { buildQueryString } from '../utils/api'

interface NovelSeriesHint {
  id: string
  title?: string
}

interface NovelWithSeriesHint {
  series?: NovelSeriesHint
}

interface NovelHistorySource {
  title: string
  coverImage?: string
}

export function hasSeriesHint(novel: NovelWithSeriesHint | null | undefined): novel is { series: NovelSeriesHint } {
  return Boolean(novel?.series?.id)
}

export function buildSeriesRequestPath(novelId: string, series: NovelSeriesHint): string {
  const queryString = buildQueryString({
    series_id: series.id,
    series_title: series.title || '',
  })

  return `/novels/${novelId}/series?${queryString}`
}

export function buildSeriesRequestPathForNovel(
  novelId: string,
  novel: NovelWithSeriesHint | null | undefined,
): string | null {
  if (!hasSeriesHint(novel)) return null

  return buildSeriesRequestPath(novelId, novel.series)
}

export function buildReadingHistoryPositionPayload(novelId: string, novel: NovelHistorySource) {
  return {
    novelId,
    position: 0,
    title: novel.title,
    coverUrl: novel.coverImage || '',
  }
}

export function buildReadingHistorySaveErrorLog(error: unknown) {
  return {
    label: 'Failed to save reading history:',
    value: error,
  }
}
