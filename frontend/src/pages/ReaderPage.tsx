import { useParams } from 'react-router-dom'
import { useNovelDetail } from '../hooks/useNovelDetail'
import NovelReader from '../components/novel/NovelReader'

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>()
  const { novel, series, isLoading, error } = useNovelDetail(id)
  const shouldShowInitialLoading = isLoading && (!novel || novel.id !== id)

  if (shouldShowInitialLoading) {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/" className="text-pixiv-blue hover:underline">
            返回首页
          </a>
        </div>
      </div>
    )
  }

  if (!novel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">小说不存在</p>
          <a href="/" className="text-pixiv-blue hover:underline">
            返回首页
          </a>
        </div>
      </div>
    )
  }

  return <NovelReader series={series} />
}
