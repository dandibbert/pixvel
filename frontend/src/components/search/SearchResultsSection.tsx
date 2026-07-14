import { useI18n } from '../../i18n/useI18n'
import { SEARCH_RESULT_BATCH_SIZE } from '../../stores/searchResultsModel'
import type { Novel, NovelKeywordMatchResult } from '../../types/search'
import Pagination from '../common/Pagination'
import { EmptyPageState, LoadingPageState } from '../common/PageState'
import NovelGrid from '../novel/NovelGrid'

interface SearchResultsSectionProps {
  isLoading: boolean
  results: Novel[]
  total: number
  totalPages: number
  currentPage: number
  visibleResultCount: number
  hasSearchQuery: boolean
  keywordMatchMap: Readonly<Record<string, NovelKeywordMatchResult>>
  onNovelClick: (novel: Novel) => void
  onRevealBlocked: (novelId: string) => void
  onPageChange: (page: number) => void
  onShowMoreResults: () => void
}

export default function SearchResultsSection({
  isLoading,
  results,
  total,
  totalPages,
  currentPage,
  visibleResultCount,
  hasSearchQuery,
  keywordMatchMap,
  onNovelClick,
  onRevealBlocked,
  onPageChange,
  onShowMoreResults,
}: SearchResultsSectionProps) {
  const { t, formatNumber } = useI18n()

  if (isLoading) {
    return <LoadingPageState label={t('search.loading')} />
  }

  if (results.length > 0) {
    const effectiveVisibleResultCount = visibleResultCount > 0
      ? Math.min(visibleResultCount, results.length)
      : Math.min(SEARCH_RESULT_BATCH_SIZE, results.length)
    const visibleResults = results.slice(0, effectiveVisibleResultCount)
    const remainingResultCount = results.length - effectiveVisibleResultCount
    const nextBatchCount = Math.min(SEARCH_RESULT_BATCH_SIZE, remainingResultCount)
    const progressPercent = Math.round(
      (effectiveVisibleResultCount / results.length) * 100,
    )

    return (
      <>
        <div className="mb-4 md:mb-6 flex items-center justify-between">
          <div className="text-foreground/55 font-bold tracking-wide text-xs md:text-sm">
            {t('search.resultsFoundPrefix')} {formatNumber(total)} {t('search.resultsFoundSuffix')}
          </div>
        </div>
        <NovelGrid
          novels={visibleResults}
          onNovelClick={onNovelClick}
          keywordMatchMap={keywordMatchMap}
          onRevealBlocked={onRevealBlocked}
        />
        {remainingResultCount > 0 && (
          <div className="mt-6 md:mt-10 rounded-2xl border border-border bg-white p-4 md:p-6 text-center shadow-sm">
            <div className="text-sm font-black text-foreground">
              {t('search.resultsShowingPrefix')}{' '}
              {formatNumber(effectiveVisibleResultCount)} / {formatNumber(results.length)}{' '}
              {t('search.resultsShowingSuffix')}
            </div>
            <div className="mt-1 text-xs font-semibold text-foreground/45">
              {t('search.resultsRemainingPrefix')}{' '}
              {formatNumber(remainingResultCount)}{' '}
              {t('search.resultsRemainingSuffix')}
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={results.length}
              aria-valuenow={effectiveVisibleResultCount}
              className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <button
              type="button"
              onClick={onShowMoreResults}
              className="mt-4 min-h-[48px] w-full rounded-xl bg-primary px-4 text-sm font-black text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {t('search.resultsLoadMorePrefix')}{' '}
              {formatNumber(nextBatchCount)}{' '}
              {t('search.resultsLoadMoreSuffix')}
            </button>
            <div className="mt-2 text-[10px] font-semibold text-foreground/35">
              {t('search.resultsPageComplete')}
            </div>
          </div>
        )}
        {remainingResultCount === 0 && totalPages > 1 && (
          <div className="mt-12 md:mt-16">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </>
    )
  }

  if (hasSearchQuery) {
    return <EmptyPageState label={t('search.emptyNoResults')} icon="search" />
  }

  return (
    <EmptyPageState
      label={t('search.emptyStartSearch')}
      icon="sparkles"
      iconPulse={true}
      tracking={true}
    />
  )
}
