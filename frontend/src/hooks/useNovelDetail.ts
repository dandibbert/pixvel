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

    const fetchData = async () => {
      await loadNovel(novelId)

      try {
        setSeriesLoading(true)
        const seriesData = await api.get<NovelSeries>(`/novels/${novelId}/series`)
        setSeries(seriesData)
      } catch (err) {
        setSeries(null)
      } finally {
        setSeriesLoading(false)
      }
    }

    fetchData()
  }, [novelId])

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
