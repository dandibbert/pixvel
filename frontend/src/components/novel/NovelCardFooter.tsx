interface NovelCardFooterProps {
  totalBookmarks: number
  textLength: number
  pageCount: number
  bookmarksTitle: string
  wordCountTitle: string
  formatNumber: (value: number) => string
}

export default function NovelCardFooter({
  totalBookmarks,
  textLength,
  pageCount,
  bookmarksTitle,
  wordCountTitle,
  formatNumber,
}: NovelCardFooterProps) {
  return (
    <div className="flex items-center justify-between pt-2 md:pt-3 mt-auto border-t border-muted flex-shrink-0">
      <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-[11px] font-medium text-foreground/40">
        <span className="flex items-center gap-1 group-hover:text-primary transition-colors" title={bookmarksTitle}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-3.5 md:w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {formatNumber(totalBookmarks)}
        </span>
        <span className="flex items-center gap-1" title={wordCountTitle}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-3.5 md:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          {formatNumber(textLength)}
        </span>
      </div>
      <span className="text-foreground/30 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
        {pageCount}P
      </span>
    </div>
  )
}
