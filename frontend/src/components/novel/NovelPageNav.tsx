import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NovelSeries } from '../../hooks/useNovelDetail'

type NavActionType = 'page' | 'series'

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
  const [pageInput, setPageInput] = useState('')

  const isOnFirstPage = currentPage === 1
  const isOnLastPage = currentPage === totalPages
  const canJumpPrevSeries = isOnFirstPage && !!series?.prev_novel
  const canJumpNextSeries = isOnLastPage && !!series?.next_novel

  const isPrevDisabled = isOnFirstPage && !series?.prev_novel
  const isNextDisabled = isOnLastPage && !series?.next_novel

  const getButtonStyle = (type: NavActionType, disabled: boolean) => {
    if (disabled) {
      return 'bg-muted text-foreground/25 border-2 border-transparent cursor-not-allowed'
    }
    return type === 'series'
      ? 'bg-primary/10 text-primary border-2 border-primary/30 hover:bg-primary/20 hover:border-primary shadow-sm'
      : 'bg-muted text-foreground/40 border-2 border-transparent hover:text-primary'
  }

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const page = parseInt(pageInput, 10)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onGoToPage(page)
      setPageInput('')
    }
  }

  return (
    <div className="sticky bottom-0 bg-white border-t-2 border-muted px-4 py-2 md:py-3 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {canJumpPrevSeries && series?.prev_novel ? (
          <Link
            to={`/novel/${series.prev_novel.id}`}
            className={`h-12 min-w-[48px] px-3 md:h-14 md:min-w-[56px] md:px-4 font-bold rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all ${getButtonStyle('series', false)}`}
            title={`上一篇: ${series.prev_novel.title}`}
            aria-label={`跳转到系列上一篇: ${series.prev_novel.title}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <span className="text-[9px] md:text-[10px] leading-none tracking-widest uppercase font-black">篇章</span>
          </Link>
        ) : (
          <button
            onClick={onPrevPage}
            disabled={isPrevDisabled}
            className={`h-12 w-12 md:h-14 md:w-14 font-black rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all ${getButtonStyle('page', isPrevDisabled)}`}
            title="上一页"
            aria-label="上一页"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[9px] md:text-[10px] leading-none tracking-widest uppercase font-black">分页</span>
          </button>
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
          <Link
            to={`/novel/${series.next_novel.id}`}
            className={`h-12 min-w-[48px] px-3 md:h-14 md:min-w-[56px] md:px-4 font-bold rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all ${getButtonStyle('series', false)}`}
            title={`下一篇: ${series.next_novel.title}`}
            aria-label={`跳转到系列下一篇: ${series.next_novel.title}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <span className="text-[9px] md:text-[10px] leading-none tracking-widest uppercase font-black">篇章</span>
          </Link>
        ) : (
          <button
            onClick={onNextPage}
            disabled={isNextDisabled}
            className={`h-12 w-12 md:h-14 md:w-14 font-black rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all ${getButtonStyle('page', isNextDisabled)}`}
            title="下一页"
            aria-label="下一页"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[9px] md:text-[10px] leading-none tracking-widest uppercase font-black">分页</span>
          </button>
        )}
      </div>
    </div>
  )
}
