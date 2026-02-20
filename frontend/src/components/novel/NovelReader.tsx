import { useEffect } from 'react'
import { useReaderStore } from '../../stores/readerStore'
import { useNovelPagination } from '../../hooks/useNovelPagination'
import { NovelSeries } from '../../hooks/useNovelDetail'
import NovelHeader from './NovelHeader'
import NovelContent from './NovelContent'
import NovelPageNav from './NovelPageNav'
import NovelSeriesNav from './NovelSeriesNav'

interface NovelReaderProps {
  series: NovelSeries | null
}

export default function NovelReader({ series }: NovelReaderProps) {
  const { novel, pages } = useReaderStore()
  const { currentPage, totalPages, goToPage, goToNextPage, goToPrevPage } = useNovelPagination()

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevPage()
      } else if (e.key === 'ArrowRight') {
        goToNextPage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrevPage, goToNextPage])

  if (!novel) {
    return null
  }

  const currentPageContent = pages[currentPage - 1]?.content || ''

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <NovelHeader novel={novel} />
      <NovelSeriesNav series={series} />

      <main className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12 flex-1">
        <article className="bg-white rounded-xl p-8 md:p-12 lg:p-20 border-b-8 border-muted">
          <NovelContent content={currentPageContent} />
        </article>
      </main>

      <div className="mt-auto">
        <NovelPageNav
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={goToPrevPage}
          onNextPage={goToNextPage}
          onGoToPage={goToPage}
        />
      </div>
    </div>
  )
}
