import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReaderStore } from '../../stores/readerStore'
import { useNovelPagination } from '../../hooks/useNovelPagination'
import { useEventListener } from '../../hooks/useEventListener'
import { NovelSeries } from '../../hooks/useNovelDetail'
import { useI18n } from '../../i18n/useI18n'
import { buildNovelPath } from '../../utils/appNavigation'
import { logErrorDescriptor } from '../../utils/errorLog'
import { downloadNovelTxt } from '../../utils/novelDownload'
import NovelHeader from './NovelHeader'
import NovelContent from './NovelContent'
import NovelPageNav from './NovelPageNav'
import NovelSeriesNav from './NovelSeriesNav'
import NovelDetailModal from './NovelDetailModal'
import { resolveReaderNavigationAction } from './novelReaderModel'

interface NovelReaderProps {
  series: NovelSeries | null
}

export default function NovelReader({ series }: NovelReaderProps) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const novel = useReaderStore((state) => state.novel)
  const pages = useReaderStore((state) => state.pages)
  const refreshNovel = useReaderStore((state) => state.refreshNovel)
  const { currentPage, totalPages, goToPage, goToNextPage, goToPrevPage } = useNovelPagination()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

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

  const canDownload = !!novel && pages.length > 0
  const downloadTitle = t('reader.downloadTxt')

  const handleDownload = useCallback(() => {
    if (!novel || pages.length === 0) {
      return
    }

    setDownloadError(null)

    try {
      downloadNovelTxt(novel, pages)
    } catch (error) {
      logErrorDescriptor({ label: 'Download novel error:', value: error })
      setDownloadError(t('reader.downloadFailed'))
    }
  }, [novel, pages, t])

  const handlePrev = useCallback(() => {
    const action = resolveReaderNavigationAction({
      direction: 'prev',
      currentPage,
      totalPages,
      series,
    })

    if (action.type === 'series') {
      navigate(buildNovelPath(action.novelId))
      return
    }

    if (action.type === 'page') {
      goToPrevPage()
    }
  }, [currentPage, totalPages, series, navigate, goToPrevPage])

  const handleNext = useCallback(() => {
    const action = resolveReaderNavigationAction({
      direction: 'next',
      currentPage,
      totalPages,
      series,
    })

    if (action.type === 'series') {
      navigate(buildNovelPath(action.novelId))
      return
    }

    if (action.type === 'page') {
      goToNextPage()
    }
  }, [currentPage, totalPages, series, navigate, goToNextPage])

  useEventListener(window, 'keydown', (event) => {
    if ((event as KeyboardEvent).key === 'ArrowLeft') {
      handlePrev()
    } else if ((event as KeyboardEvent).key === 'ArrowRight') {
      handleNext()
    }
  })

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
        onDownload={handleDownload}
        canDownload={canDownload}
        downloadTitle={downloadTitle}
      />
      <NovelSeriesNav series={series} />

      <main className="w-full max-w-4xl mx-auto px-4 md:px-6 pt-12 pb-28 md:pb-32 flex-1">
        <article className="bg-white rounded-xl p-8 md:p-12 lg:p-20 border-b-8 border-muted">
          <NovelContent content={currentPageContent} onJumpToPage={goToPage} />
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

      {downloadError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-full z-50 border border-red-200 text-sm">
          {downloadError}
        </div>
      )}

      {/* Refresh indicator */}
      {isRefreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg z-50">
          Refreshing...
        </div>
      )}
    </div>
  )
}
