import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import NovelGrid from '../components/novel/NovelGrid'
import NovelPreviewModal from '../components/novel/NovelPreviewModal'
import { Novel } from '../types/novel'
import { api } from '../utils/api'

interface AuthorResponse {
  author: {
    id: string
    name: string
    avatar?: string
  }
  novels: Novel[]
  page: number
  nextPage: number | null
  hasMore: boolean
}

export default function AuthorPage() {
  const { id } = useParams()
  const [author, setAuthor] = useState<AuthorResponse['author'] | null>(null)
  const [novels, setNovels] = useState<Novel[]>([])
  const [page, setPage] = useState(1)
  const [nextPage, setNextPage] = useState<number | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    setAuthor(null)
    setNovels([])
    setPage(1)
    setNextPage(null)
    setHasMore(false)
    setError(null)
  }, [id])

  useEffect(() => {
    if (!id) return

    const fetchAuthorNovels = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await api.get<AuthorResponse>(`/novels/user/${id}`, {
          page,
        })

        setAuthor(response.author)
        setNovels((prev) => (page === 1 ? response.novels : [...prev, ...response.novels]))
        setHasMore(response.hasMore)
        setNextPage(response.nextPage ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载作者作品失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAuthorNovels()
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
      <div className="bg-primary pt-16 pb-24 md:pt-20 md:pb-32 px-4 mb-[-4rem]">
        <div className="max-w-7xl mx-auto">
          <p className="text-white/60 text-xs font-black uppercase tracking-[0.4em] mb-3">作者作品</p>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">
            {author?.name || '加载中...'}
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-bold max-w-2xl leading-tight">
            {novels.length > 0 ? `已加载 ${novels.length} 篇` : '浏览该作者的所有作品'}
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

          {isLoading && novels.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block animate-bounce h-16 w-16 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-6 text-2xl font-black text-primary uppercase tracking-widest">加载中...</p>
            </div>
          ) : novels.length > 0 ? (
            <>
              <NovelGrid novels={novels} onNovelClick={handleNovelClick} />
              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="h-14 px-10 bg-primary text-white font-black rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {isLoading ? '加载中...' : '加载更多'}
                  </button>
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
              <p className="text-2xl font-black text-foreground/30 uppercase">暂无作者作品</p>
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
