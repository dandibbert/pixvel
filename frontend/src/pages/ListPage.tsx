import { useState, useEffect } from 'react'
import { useURLState } from '../hooks/useURLState'
import { useNovelPreview } from '../hooks/useNovelPreview'
import { EmptyPageState, LoadingPageState } from '../components/common/PageState'
import NovelGrid from '../components/novel/NovelGrid'
import NovelPreviewModal from '../components/novel/NovelPreviewModal'
import Pagination from '../components/common/Pagination'
import { Novel } from '../types/novel'
import { api } from '../utils/api'
import { navigateCurrentWindowToPath } from '../utils/appNavigation'
import { setDocumentTitle } from '../utils/documentTitle'
import { scrollViewportToTop } from '../utils/pageScroll'
import { formatCountTemplate } from '../utils/textTemplate'
import { useI18n } from '../i18n/useI18n'
import {
  buildBookmarkListDocumentTitle,
  buildBookmarkListViewModel,
  buildBookmarkListRequestParams,
  getBookmarkListLoadErrorMessage,
} from './listPageModel'

export default function ListPage() {
  const { t, formatNumber } = useI18n()

  useEffect(() => {
    setDocumentTitle(buildBookmarkListDocumentTitle(t('list.documentTitleDefault')))
  }, [t])

  const [urlState, setUrlState] = useURLState({ page: 1 })
  const [novels, setNovels] = useState<Novel[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const novelPreview = useNovelPreview<Novel>()

  const limit = 20
  const viewModel = buildBookmarkListViewModel({
    isLoading,
    novelCount: novels.length,
    total,
    limit,
    formatTotalLabel: (count) =>
      formatCountTemplate({
        template: t('list.total'),
        count,
        formatNumber,
      }),
  })

  useEffect(() => {
    loadBookmarks()
  }, [urlState.page])

  const loadBookmarks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.get<{ novels: Novel[]; total: number }>(
        '/bookmarks',
        buildBookmarkListRequestParams({ page: urlState.page, limit })
      )
      setNovels(response.novels)
      setTotal(response.total)
    } catch (err) {
      setError(getBookmarkListLoadErrorMessage(err, t('list.loadErrorFallback')))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setUrlState({ page: newPage })
    scrollViewportToTop()
  }

  return (
    <div className="min-h-screen">
      {/* Bold Header Section */}
      <div className="bg-primary pt-12 pb-16 md:pt-20 md:pb-32 px-4 mb-[-2.5rem] md:mb-[-4rem]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-6xl font-bold text-white mb-2 tracking-tight">
            {t('list.title')}
          </h1>
          <p className="text-white/80 text-sm md:text-xl font-medium max-w-2xl">
            {t('list.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-2xl p-4 md:p-8 border border-border/50 shadow-xl shadow-black/5">
          {error && (
            <div className="mb-6 p-4 md:p-6 bg-accent/10 border-l-4 border-accent rounded-r-lg">
              <p className="text-accent font-bold text-base md:text-lg">{error}</p>
            </div>
          )}

          {viewModel.state === 'loading' ? (
            <LoadingPageState label={t('list.loading')} />
          ) : viewModel.state === 'results' ? (
            <>
              <div className="mb-4 md:mb-6 flex items-center justify-between">
                <div className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                  {viewModel.totalLabel}
                </div>
              </div>

              <NovelGrid novels={novels} onNovelClick={novelPreview.openPreview} />

              {viewModel.showPagination && (
                <div className="mt-12 md:mt-16">
                  <Pagination
                    currentPage={urlState.page}
                    totalPages={viewModel.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyPageState
              label={t('list.empty')}
              icon="book"
              actionLabel={t('list.discover')}
              onAction={() => navigateCurrentWindowToPath(viewModel.emptyActionPath)}
            />
          )}
        </div>
      </div>

      <NovelPreviewModal
        {...novelPreview.previewModalProps}
      />
    </div>
  )
}
