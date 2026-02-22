import { useState, useEffect } from 'react'
import { useURLState } from '../hooks/useURLState'
import NovelGrid from '../components/novel/NovelGrid'
import NovelPreviewModal from '../components/novel/NovelPreviewModal'
import Pagination from '../components/common/Pagination'
import { Novel } from '../types/novel'
import { api } from '../utils/api'

export default function ListPage() {
  useEffect(() => {
    document.title = '我的收藏 - Pixvel'
  }, [])

  const [urlState, setUrlState] = useURLState({ page: 1 })
  const [novels, setNovels] = useState<Novel[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const limit = 20
  const totalPages = Math.ceil(total / limit)

  useEffect(() => {
    loadBookmarks()
  }, [urlState.page])

  const loadBookmarks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.get<{ novels: Novel[]; total: number }>(
        '/bookmarks',
        { page: urlState.page, limit }
      )
      setNovels(response.novels)
      setTotal(response.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载收藏失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setUrlState({ page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNovelClick = (novel: Novel) => {
    setSelectedNovel(novel)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen">
      {/* Bold Header Section */}
      <div className="bg-primary pt-12 pb-16 md:pt-20 md:pb-32 px-4 mb-[-2.5rem] md:mb-[-4rem]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-6xl font-bold text-white mb-2 tracking-tight">
            我的收藏
          </h1>
          <p className="text-white/80 text-sm md:text-xl font-medium max-w-2xl">
            随时开启您的下一次阅读旅程
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

          {isLoading ? (
            <div className="text-center py-16 md:py-20">
              <div className="inline-block animate-bounce h-12 w-12 md:h-16 md:w-16 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 md:mt-6 text-lg md:text-2xl font-bold text-primary uppercase tracking-widest">加载中...</p>
            </div>
          ) : novels.length > 0 ? (
            <>
              <div className="mb-4 md:mb-6 flex items-center justify-between">
                <div className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                  共 {total.toLocaleString()} 个收藏
                </div>
              </div>

              <NovelGrid novels={novels} onNovelClick={handleNovelClick} />

              {totalPages > 1 && (
                <div className="mt-12 md:mt-16">
                  <Pagination
                    currentPage={urlState.page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
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
              <p className="text-xl md:text-2xl font-bold text-foreground/30 uppercase mb-6">您还没有收藏任何小说</p>
              <button
                onClick={() => window.location.href = '/search'}
                className="px-8 py-3 md:px-10 md:py-4 bg-primary text-white font-bold rounded-lg hover:scale-105 transition-all"
              >
                去发现新作品
              </button>
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
