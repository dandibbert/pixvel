import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNovelDetail } from '../hooks/useNovelDetail'
import NovelReader from '../components/novel/NovelReader'
import { useReaderStore } from '../stores/readerStore'
import { useI18n } from '../i18n/useI18n'
import { setDocumentTitle } from '../utils/documentTitle'
import {
  buildReaderDocumentTitle,
  resolveReaderErrorMessage,
  shouldShowReaderInitialLoading,
} from './readerPageModel'

export default function ReaderPage() {
  const { t } = useI18n()
  const { id } = useParams<{ id: string }>()
  const { novel, series, isLoading, error } = useNovelDetail(id)
  const currentPage = useReaderStore((state) => state.currentPage)
  const totalPages = useReaderStore((state) => state.totalPages)
  const shouldShowInitialLoading = shouldShowReaderInitialLoading({
    isLoading,
    requestedNovelId: id,
    loadedNovel: novel,
  })

  useEffect(() => {
    setDocumentTitle(buildReaderDocumentTitle({
      shouldShowInitialLoading,
      novelTitle: novel?.title,
      currentPage,
      totalPages,
      error,
      t,
    }))
  }, [shouldShowInitialLoading, novel?.title, currentPage, totalPages, error, t])

  if (shouldShowInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pixiv-blue mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    const errorMessage = resolveReaderErrorMessage(error, t)

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <a href="/" className="text-pixiv-blue hover:underline">
            {t('common.backHome')}
          </a>
        </div>
      </div>
    )
  }

  if (!novel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{t('reader.notFound')}</p>
          <a href="/" className="text-pixiv-blue hover:underline">
            {t('common.backHome')}
          </a>
        </div>
      </div>
    )
  }

  return <NovelReader series={series} />
}
