import { useState } from 'react'
import { NovelSeries } from '../../hooks/useNovelDetail'
import { useI18n } from '../../i18n/useI18n'
import { buildNovelPath } from '../../utils/appNavigation'
import { parseBoundedPageInput } from '../../utils/pageInput'
import NovelPageNavAction from './NovelPageNavAction'
import { resolveNovelPageNavState } from './novelPageNavModel'

interface NovelPageNavProps {
  currentPage: number
  totalPages: number
  onPrevPage: () => void
  onNextPage: () => void
  onGoToPage: (page: number) => void
  series: NovelSeries | null
}

export default function NovelPageNav({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onGoToPage,
  series,
}: NovelPageNavProps) {
  const { t } = useI18n()
  const [pageInput, setPageInput] = useState('')

  const {
    canJumpPrevSeries,
    canJumpNextSeries,
    isPrevDisabled,
    isNextDisabled,
  } = resolveNovelPageNavState({
    currentPage,
    totalPages,
    hasPrevSeries: Boolean(series?.prev_novel),
    hasNextSeries: Boolean(series?.next_novel),
  })

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const page = parseBoundedPageInput(pageInput, totalPages)
    if (page !== null) {
      onGoToPage(page)
      setPageInput('')
    }
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 bg-white border-t-2 border-muted px-4 py-2 md:py-3 z-50"
      style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {canJumpPrevSeries && series?.prev_novel ? (
          <NovelPageNavAction
            type="series"
            to={buildNovelPath(series.prev_novel.id)}
            title={`${t('pageNav.prevSeriesPrefix')}: ${series.prev_novel.title}`}
            ariaLabel={`${t('pageNav.prevSeriesAriaPrefix')}: ${series.prev_novel.title}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <span className="text-[9px] md:text-[10px] leading-none tracking-widest uppercase font-black">{t('pageNav.seriesBadge')}</span>
          </NovelPageNavAction>
        ) : (
          <NovelPageNavAction
            type="page"
            onClick={onPrevPage}
            disabled={isPrevDisabled}
            title={t('pageNav.prevPage')}
            ariaLabel={t('pageNav.prevPage')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[9px] md:text-[10px] leading-none tracking-widest uppercase font-black">{t('pageNav.pageBadge')}</span>
          </NovelPageNavAction>
        )}

        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-center">
          <form onSubmit={handlePageSubmit} className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              placeholder={currentPage.toString()}
              className="w-12 h-10 md:h-12 bg-muted border-none rounded-lg font-black text-center text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-foreground"
            />
            <span className="text-[10px] md:text-xs font-black text-foreground/20 uppercase tracking-widest">/ {totalPages}</span>
          </form>
        </div>

        {canJumpNextSeries && series?.next_novel ? (
          <NovelPageNavAction
            type="series"
            to={buildNovelPath(series.next_novel.id)}
            title={`${t('pageNav.nextSeriesPrefix')}: ${series.next_novel.title}`}
            ariaLabel={`${t('pageNav.nextSeriesAriaPrefix')}: ${series.next_novel.title}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <span className="text-[9px] md:text-[10px] leading-none tracking-widest uppercase font-black">{t('pageNav.seriesBadge')}</span>
          </NovelPageNavAction>
        ) : (
          <NovelPageNavAction
            type="page"
            onClick={onNextPage}
            disabled={isNextDisabled}
            title={t('pageNav.nextPage')}
            ariaLabel={t('pageNav.nextPage')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[9px] md:text-[10px] leading-none tracking-widest uppercase font-black">{t('pageNav.pageBadge')}</span>
          </NovelPageNavAction>
        )}
      </div>
    </div>
  )
}
