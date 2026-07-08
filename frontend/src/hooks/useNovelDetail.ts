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
  const { novel, isLoading, error, loadNovel } = useReaderStore()
  const [series, setSeries] = useState<NovelSeries | null>(null)
  const [seriesLoading, setSeriesLoading] = useState(false)

  useEffect(() => {
    if (!novelId) return

    // Reset scroll position when loading a new novel
    scrollViewportToTop({ behavior: 'auto' })
    setSeries(null)

    const fetchData = async () => {
      await loadNovel(novelId)

      // Get the loaded novel from store
      const loadedNovel = useReaderStore.getState().novel

      const seriesRequestPath = buildSeriesRequestPathForNovel(novelId, loadedNovel)
      if (!seriesRequestPath) {
        setSeries(null)
        return
      }

      try {
        setSeriesLoading(true)
        // Pass series_id and series_title to skip redundant detail API call
        const seriesData = await api.get<NovelSeries>(seriesRequestPath)
        setSeries(seriesData)
      } catch (err) {
        setSeries(null)
      } finally {
        setSeriesLoading(false)
      }
    }

    fetchData()
  }, [novelId, loadNovel])

  // Save to reading history when novel is loaded
  useEffect(() => {
    if (!novel || !novelId) return

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
