interface NovelStatsRowProps {
  mode: 'preview' | 'reader'
  textLength: number
  totalBookmarks: number
  totalViews: number
  pageCount: number
  formatNumber: (value: number) => string
}

export default function NovelStatsRow({
  mode,
  textLength,
  totalBookmarks,
  totalViews,
  pageCount,
  formatNumber,
}: NovelStatsRowProps) {
  return (
    <div className="flex items-center space-x-6 md:space-x-8 text-xs md:text-sm font-semibold text-foreground/50">
      <span className="flex items-center gap-1.5 md:gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        {formatNumber(textLength)}
      </span>
      <span className="flex items-center gap-1.5 md:gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        {formatNumber(totalBookmarks)}
      </span>
      <span className="flex items-center gap-1.5 md:gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {formatNumber(totalViews)}
      </span>
      {mode === 'preview' && (
        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-bold">
          {pageCount}P
        </span>
      )}
    </div>
  )
}
