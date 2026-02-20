import { useEffect, useState } from 'react'
import { useReaderStore } from '../stores/readerStore'
import { api } from '../utils/api'

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
    window.scrollTo(0, 0)
    setSeries(null)

    const fetchData = async () => {
      await loadNovel(novelId)

      // Get the loaded novel from store
      const loadedNovel = useReaderStore.getState().novel

      // If novel has no series, skip series API call
      if (!loadedNovel?.series?.id) {
        setSeries(null)
        return
      }

      try {
        setSeriesLoading(true)
        // Pass series_id and series_title to skip redundant detail API call
        const params = new URLSearchParams({
          series_id: loadedNovel.series.id,
          series_title: loadedNovel.series.title || '',
        })
        const seriesData = await api.get<NovelSeries>(`/novels/${novelId}/series?${params}`)
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
        await api.post('/history/position', {
          novelId,
          position: 0,
          title: novel.title,
          coverUrl: novel.coverImage || '',
        })
      } catch (err) {
        console.error('Failed to save reading history:', err)
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
