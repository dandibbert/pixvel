import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReaderStore } from '../../stores/readerStore'
import { useNovelPagination } from '../../hooks/useNovelPagination'
import { NovelSeries } from '../../hooks/useNovelDetail'
import NovelHeader from './NovelHeader'
import NovelContent from './NovelContent'
import NovelPageNav from './NovelPageNav'
import NovelSeriesNav from './NovelSeriesNav'
import NovelDetailModal from './NovelDetailModal'

interface NovelReaderProps {
  series: NovelSeries | null
}

export default function NovelReader({ series }: NovelReaderProps) {
  const navigate = useNavigate()
  const { novel, pages } = useReaderStore()
  const refreshNovel = useReaderStore((state) => state.refreshNovel)
  const { currentPage, totalPages, goToPage, goToNextPage, goToPrevPage } = useNovelPagination()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const isOnFirstPage = currentPage === 1
  const isOnLastPage = totalPages > 0 ? currentPage === totalPages : true
  const canJumpPrevSeries = isOnFirstPage && !!series?.prev_novel
  const canJumpNextSeries = isOnLastPage && !!series?.next_novel

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await refreshNovel()
    } finally {
      setIsRefreshing(false)
    }
  }, [refreshNovel])

  const handleTitleClick = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handlePrev = useCallback(() => {
    if (canJumpPrevSeries && series?.prev_novel) {
      navigate(`/novel/${series.prev_novel.id}`)
      return
    }
    if (!isOnFirstPage) {
      goToPrevPage()
    }
  }, [canJumpPrevSeries, series, navigate, isOnFirstPage, goToPrevPage])

  const handleNext = useCallback(() => {
    if (canJumpNextSeries && series?.next_novel) {
      navigate(`/novel/${series.next_novel.id}`)
      return
    }
    if (!isOnLastPage) {
      goToNextPage()
    }
  }, [canJumpNextSeries, series, navigate, isOnLastPage, goToNextPage])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrev, handleNext])

  if (!novel) {
    return null
  }

  const currentPageContent = pages[currentPage - 1]?.content || ''

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <NovelHeader
        novel={novel}
        onTitleClick={handleTitleClick}
        onRefresh={handleRefresh}
      />
      <NovelSeriesNav series={series} />

      <main className="w-full max-w-4xl mx-auto px-4 md:px-6 pt-12 pb-28 md:pb-32 flex-1">
        <article className="bg-white rounded-xl p-8 md:p-12 lg:p-20 border-b-8 border-muted">
          <NovelContent content={currentPageContent} />
        </article>
      </main>

      <NovelPageNav
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={handlePrev}
        onNextPage={handleNext}
        onGoToPage={goToPage}
        series={series}
      />

      <NovelDetailModal
        novel={novel}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Refresh indicator */}
      {isRefreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg z-50">
          Refreshing...
        </div>
      )}
    </div>
  )
}
