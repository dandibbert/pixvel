import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import NovelGrid from '../components/novel/NovelGrid'
import NovelPreviewModal from '../components/novel/NovelPreviewModal'
import { Novel } from '../types/novel'
import { api } from '../utils/api'

interface SeriesResponse {
  series: {
    id: string
    title: string
  }
  novels: Novel[]
  page: number
  nextPage: number | null
  hasMore: boolean
}

export default function SeriesPage() {
  const { id } = useParams()
  const [series, setSeries] = useState<SeriesResponse['series'] | null>(null)
  const [novels, setNovels] = useState<Novel[]>([])
  const [page, setPage] = useState(1)
  const [nextPage, setNextPage] = useState<number | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    document.title = series?.title ? `${series.title} - 系列 - Pixvel` : '系列作品 - Pixvel'
  }, [series?.title])

  useEffect(() => {
    if (!id) return
    setSeries(null)
    setNovels([])
    setPage(1)
    setNextPage(null)
    setHasMore(false)
    setError(null)
  }, [id])

  useEffect(() => {
    if (!id) return

    const fetchSeries = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await api.get<SeriesResponse>(`/novels/series/${id}`, {
          page,
        })

        setSeries(response.series)
        setNovels((prev) => (page === 1 ? response.novels : [...prev, ...response.novels]))
        setHasMore(response.hasMore)
        setNextPage(response.nextPage ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载系列失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSeries()
  }, [id, page])

  const handleNovelClick = (novel: Novel) => {
    setSelectedNovel(novel)
    setIsModalOpen(true)
  }

  const handleLoadMore = () => {
    if (isLoading || !hasMore) return
    setPage(nextPage ?? page + 1)
  }

  return (
    <div className="min-h-screen">
      <div className="bg-primary pt-12 pb-16 md:pt-20 md:pb-32 px-4 mb-[-2.5rem] md:mb-[-4rem]">
        <div className="max-w-7xl mx-auto">
          <p className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2">系列</p>
          <h1 className="text-2xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            {series?.title || '加载中...'}
          </h1>
          <p className="text-white/80 text-sm md:text-lg font-medium max-w-2xl">
            {novels.length > 0 ? `已加载 ${novels.length} 篇` : '浏览该系列的所有作品'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-2xl p-4 md:p-8 border border-border/50 shadow-xl shadow-black/5">
          {error && (
            <div className="mb-6 p-4 md:p-6 bg-accent/10 border-l-4 border-accent rounded-r-lg">
              <p className="text-accent font-bold text-base md:text-lg">{error}</p>
            </div>
          )}

          {isLoading && novels.length === 0 ? (
            <div className="text-center py-16 md:py-20">
              <div className="inline-block animate-bounce h-12 w-12 md:h-16 md:w-16 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 md:mt-6 text-lg md:text-2xl font-bold text-primary uppercase tracking-widest">加载中...</p>
            </div>
          ) : novels.length > 0 ? (
            <>
              <NovelGrid novels={novels} onNovelClick={handleNovelClick} />
              {hasMore && (
                <div className="mt-8 md:mt-12 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="h-12 md:h-14 px-8 md:px-10 bg-primary text-white font-bold rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {isLoading ? '加载中...' : '加载更多'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 md:py-24 bg-muted/50 rounded-xl">
              <div className="flex justify-center mb-6 md:mb-8">
                <div className="p-6 md:p-8 bg-muted rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 md:h-20 md:w-20 text-foreground/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-foreground/30 uppercase">暂无系列作品</p>
            </div>
          )}
        </div>
      </div>

      <NovelPreviewModal
        novel={selectedNovel}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
