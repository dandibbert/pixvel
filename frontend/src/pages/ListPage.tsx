import { useState, useEffect } from 'react'
import { useURLState } from '../hooks/useURLState'
import NovelGrid from '../components/novel/NovelGrid'
import NovelPreviewModal from '../components/novel/NovelPreviewModal'
import Pagination from '../components/common/Pagination'
import { Novel } from '../types/novel'
import { api } from '../utils/api'

export default function ListPage() {
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
      <div className="bg-primary pt-16 pb-24 md:pt-20 md:pb-32 px-4 mb-[-4rem]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter uppercase">
            我的收藏
          </h1>
          <p className="text-white/80 text-xl md:text-2xl font-bold max-w-2xl leading-tight">
            您收藏的小说列表，随时开启下一次阅读旅程。
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-xl p-6 md:p-10 border-b-8 border-muted">
          {error && (
            <div className="mb-8 p-6 bg-accent/10 border-l-8 border-accent rounded-r-lg">
              <p className="text-accent font-black text-lg">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-bounce h-16 w-16 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-6 text-2xl font-black text-primary uppercase tracking-widest">加载中...</p>
            </div>
          ) : novels.length > 0 ? (
            <>
              <div className="mb-10 flex items-center justify-between">
                <div className="bg-muted px-6 py-3 rounded-lg font-black text-foreground/50 uppercase tracking-widest text-sm">
                  共 {total.toLocaleString()} 个收藏
                </div>
              </div>
              
              <NovelGrid novels={novels} onNovelClick={handleNovelClick} />
              
              {totalPages > 1 && (
                <div className="mt-16">
                  <Pagination
                    currentPage={urlState.page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 bg-muted/50 rounded-xl">
              <div className="flex justify-center mb-8">
                <div className="p-8 bg-muted rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-foreground/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-black text-foreground/30 uppercase">您还没有收藏任何小说</p>
              <button 
                onClick={() => window.location.href = '/search'}
                className="mt-8 px-10 py-4 bg-primary text-white font-black rounded-lg hover:scale-105 transition-all"
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
