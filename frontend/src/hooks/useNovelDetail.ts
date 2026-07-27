import { useEffect, useState } from 'react'
import { useReaderStore } from '../stores/readerStore'
import { api } from '../utils/api'
import { logErrorDescriptor } from '../utils/errorLog'
import { scrollViewportToTop } from '../utils/pageScroll'
import {
  buildReadingHistorySaveErrorLog,
  buildReadingHistoryPositionPayload,
  buildSeriesRequestPathForNovel,
} from './useNovelDetailModel'

export interface NovelSeries {
  id: string
  title: string
  prev_novel?: {
    id: string
    title: string
  }
  next_novel?: {
    id: string
    title: string
  }
}

export function useNovelDetail(novelId: string | undefined) {
  const novel = useReaderStore((state) => state.novel)
  const isLoading = useReaderStore((state) => state.isLoading)
  const error = useReaderStore((state) => state.error)
  const loadNovel = useReaderStore((state) => state.loadNovel)
  const [series, setSeries] = useState<NovelSeries | null>(null)
  const [seriesLoading, setSeriesLoading] = useState(false)

  useEffect(() => {
    if (!novelId) return

    let isActive = true

    // Reset scroll position when loading a new novel
    scrollViewportToTop({ behavior: 'auto' })
    setSeries(null)

    const fetchData = async () => {
      await loadNovel(novelId)
      if (!isActive) return

      // Get the loaded novel from store
      const loadedNovel = useReaderStore.getState().novel

      // Guard against stale state from a superseded navigation
      if (!loadedNovel || loadedNovel.id !== novelId) {
        setSeries(null)
        return
      }

      const seriesRequestPath = buildSeriesRequestPathForNovel(novelId, loadedNovel)
      if (!seriesRequestPath) {
        setSeries(null)
        return
      }

      try {
        setSeriesLoading(true)
        // Pass series_id and series_title to skip redundant detail API call
        const seriesData = await api.get<NovelSeries>(seriesRequestPath)
        if (isActive) setSeries(seriesData)
      } catch (err) {
        if (isActive) setSeries(null)
      } finally {
        if (isActive) setSeriesLoading(false)
      }
    }

    fetchData()

    return () => {
      isActive = false
    }
  }, [novelId, loadNovel])

  // Save to reading history when novel is loaded
  useEffect(() => {
    // novel.id must match the route param so a superseded navigation
    // cannot record history for the wrong novel
    if (!novel || !novelId || novel.id !== novelId) return

    const saveToHistory = async () => {
      try {
        await api.post('/history/position', buildReadingHistoryPositionPayload(novelId, novel))
      } catch (err) {
        const errorLog = buildReadingHistorySaveErrorLog(err)
        logErrorDescriptor(errorLog)
      }
    }

    saveToHistory()
  }, [novel, novelId])

  return {
    novel,
    series,
    isLoading: isLoading || seriesLoading,
    error,
  }
}
