import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNovelDetail } from '../hooks/useNovelDetail'
import NovelReader from '../components/novel/NovelReader'
import { useReaderStore } from '../stores/readerStore'
import { useI18n } from '../i18n/useI18n'

export default function ReaderPage() {
  const { t } = useI18n()
  const { id } = useParams<{ id: string }>()
  const { novel, series, isLoading, error } = useNovelDetail(id)
  const currentPage = useReaderStore((state) => state.currentPage)
  const totalPages = useReaderStore((state) => state.totalPages)
  const shouldShowInitialLoading = isLoading && (!novel || novel.id !== id)

  useEffect(() => {
    if (shouldShowInitialLoading) {
      document.title = t('reader.documentTitleLoading')
      return
    }

    if (novel?.title) {
      const pageInfo = totalPages > 0 ? ` (${currentPage}/${totalPages})` : ''
      document.title = `${novel.title}${pageInfo} - Pixvel`
      return
    }

    if (error) {
      document.title = t('reader.documentTitleError')
      return
    }

    document.title = t('reader.documentTitleDefault')
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
    const errorMessage =
      error === 'ERR_READER_CONTENT_EMPTY'
        ? t('reader.contentEmptyError')
        : error === 'ERR_READER_LOAD_FAILED'
          ? t('reader.loadFailedError')
          : error

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
