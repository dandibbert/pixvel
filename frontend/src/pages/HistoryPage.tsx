import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'
import { api } from '../utils/api'
import { buildNovelPath } from '../utils/appNavigation'
import { setDocumentTitle } from '../utils/documentTitle'
import HistoryEntryCard from './HistoryEntryCard'
import {
  buildHistoryDocumentTitle,
  buildHistoryEntryDateFormatter,
  buildHistoryEntryCardViewModel,
  buildHistoryListRequestPath,
  buildHistoryPageViewModel,
  buildHistorySubtitle,
  getHistoryLoadErrorMessage,
} from './historyPageModel'

interface HistoryEntry {
  novelId: string
  title: string
  coverUrl: string
  lastReadAt: number
  position: number
}

export default function HistoryPage() {
  const { locale, t, formatNumber } = useI18n()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setDocumentTitle(buildHistoryDocumentTitle(t('history.documentTitleDefault')))
  }, [t])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.get<{ history: HistoryEntry[] }>(buildHistoryListRequestPath(50))
      setHistory(response.history)
    } catch (err) {
      setError(getHistoryLoadErrorMessage(err, t('history.loadErrorFallback')))
    } finally {
      setIsLoading(false)
    }
  }

  const handleNovelClick = (novelId: string) => {
    navigate(buildNovelPath(novelId))
  }

  const formatDate = buildHistoryEntryDateFormatter({
    locale,
    t,
    formatNumber,
  })

  const viewModel = buildHistoryPageViewModel({
    isLoading,
    hasError: Boolean(error),
    historyCount: history.length,
    formatSubtitle: (count) =>
      buildHistorySubtitle({
        template: t('history.subtitle'),
        count,
        formatNumber,
      }),
  })

  if (viewModel.state === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pixiv-blue mx-auto mb-4"></div>
          <p className="text-gray-600">{t('history.loading')}</p>
        </div>
      </div>
    )
  }

  if (viewModel.state === 'error') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadHistory}
            className="text-pixiv-blue hover:underline"
          >
            {t('history.retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="bg-primary pt-12 pb-16 md:pt-20 md:pb-32 px-4 mb-[-2.5rem] md:mb-[-4rem]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-6xl font-bold text-white mb-2 tracking-tight">
            {t('history.title')}
          </h1>
          <p className="text-white/80 text-sm md:text-xl font-medium max-w-2xl">
            {viewModel.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-2xl p-4 md:p-8 border border-border/50 shadow-xl shadow-black/5">
          {viewModel.state === 'empty' ? (
            <div className="text-center py-16 md:py-24 bg-muted/50 rounded-xl">
              <div className="flex justify-center mb-6 md:mb-8">
                <div className="p-6 md:p-8 bg-muted rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 md:h-20 md:w-20 text-foreground/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-foreground/30 uppercase">{t('history.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {history.map((entry) => {
                const entryViewModel = buildHistoryEntryCardViewModel({
                  position: entry.position,
                })

                return (
                  <HistoryEntryCard
                    key={entry.novelId}
                    title={entry.title}
                    formattedDate={formatDate(entry.lastReadAt)}
                    showContinue={entryViewModel.showContinue}
                    continueLabel={t('history.continue')}
                    onClick={() => handleNovelClick(entry.novelId)}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
