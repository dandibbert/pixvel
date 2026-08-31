import { useI18n } from '../../i18n/useI18n'
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
  hasSearchQuery: boolean
  keywordMatchMap: Readonly<Record<string, NovelKeywordMatchResult>>
  onNovelClick: (novel: Novel) => void
  onRevealBlocked: (novelId: string) => void
  onPageChange: (page: number) => void
}

export default function SearchResultsSection({
  isLoading,
  results,
  total,
  totalPages,
  currentPage,
  hasSearchQuery,
  keywordMatchMap,
  onNovelClick,
  onRevealBlocked,
  onPageChange,
}: SearchResultsSectionProps) {
  const { t, formatNumber } = useI18n()

  if (isLoading) {
    return <LoadingPageState label={t('search.loading')} />
  }

  if (results.length > 0) {
    return (
      <>
        <div className="mb-4 md:mb-6 flex items-center justify-between">
          <div className="text-foreground/55 font-bold tracking-wide text-xs md:text-sm">
            {t('search.resultsFoundPrefix')} {formatNumber(total)} {t('search.resultsFoundSuffix')}
          </div>
        </div>
        <NovelGrid
          novels={results}
          onNovelClick={onNovelClick}
          keywordMatchMap={keywordMatchMap}
          onRevealBlocked={onRevealBlocked}
        />
        {totalPages > 1 && (
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
