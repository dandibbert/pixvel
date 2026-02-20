import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'

interface HistoryEntry {
  novelId: string
  title: string
  coverUrl: string
  lastReadAt: number
  position: number
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.get<{ history: HistoryEntry[] }>('/history/novels?limit=50')
      setHistory(response.history)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载历史记录失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNovelClick = (novelId: string) => {
    navigate(`/novel/${novelId}`)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return '今天'
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pixiv-blue mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadHistory}
            className="text-pixiv-blue hover:underline"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Bold Header Section */}
      <div className="bg-primary pt-16 pb-24 md:pt-20 md:pb-32 px-4 mb-[-4rem]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter uppercase">
            阅读历史
          </h1>
          <p className="text-white/80 text-xl md:text-2xl font-bold max-w-2xl leading-tight">
            最近阅读的 {history.length} 部小说，记录您的每一次阅读。
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-xl p-6 md:p-10 border-b-8 border-muted">
          {history.length === 0 ? (
            <div className="text-center py-24 bg-muted/50 rounded-xl">
              <div className="flex justify-center mb-8">
                <div className="p-8 bg-muted rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-foreground/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-black text-foreground/30 uppercase">暂无阅读历史</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {history.map((entry) => (
                <div
                  key={entry.novelId}
                  onClick={() => handleNovelClick(entry.novelId)}
                  className="bg-muted rounded-lg overflow-hidden transition-all duration-200 cursor-pointer group flex flex-col h-full hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="p-6 flex flex-col gap-4 flex-1">
                    <h3 className="text-xl font-extrabold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight tracking-tight">
                      {entry.title}
                    </h3>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-white/50">
                      <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{formatDate(entry.lastReadAt)}</span>
                      {entry.position > 0 && (
                        <span className="bg-primary text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">继续阅读</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
