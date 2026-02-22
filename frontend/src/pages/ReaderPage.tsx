import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNovelDetail } from '../hooks/useNovelDetail'
import NovelReader from '../components/novel/NovelReader'
import { useReaderStore } from '../stores/readerStore'

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>()
  const { novel, series, isLoading, error } = useNovelDetail(id)
  const currentPage = useReaderStore((state) => state.currentPage)
  const totalPages = useReaderStore((state) => state.totalPages)
  const shouldShowInitialLoading = isLoading && (!novel || novel.id !== id)

  useEffect(() => {
    if (shouldShowInitialLoading) {
      document.title = '加载小说中 - Pixvel'
      return
    }

    if (novel?.title) {
      const pageInfo = totalPages > 0 ? ` (${currentPage}/${totalPages})` : ''
      document.title = `${novel.title}${pageInfo} - Pixvel`
      return
    }

    if (error) {
      document.title = '阅读失败 - Pixvel'
      return
    }

    document.title = '阅读小说 - Pixvel'
  }, [shouldShowInitialLoading, novel?.title, currentPage, totalPages, error])

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
