import { NovelSeries } from '../../hooks/useNovelDetail'

interface NovelSeriesNavProps {
  series: NovelSeries | null
}

export default function NovelSeriesNav({ series }: NovelSeriesNavProps) {
  if (!series || (!series.prev_novel && !series.next_novel)) {
    return null
  }

  return (
    <div className="bg-muted/50 border-b border-border px-3 md:px-6 py-2 md:py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 md:gap-4">
        <div className="flex-1 min-w-0">
          {series.prev_novel ? (
            <a
              href={`/novel/${series.prev_novel.id}`}
              className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-2 rounded-lg bg-white border border-border hover:border-primary hover:bg-primary/5 text-xs md:text-sm text-foreground font-semibold min-h-[44px] touch-manipulation transition-all"
              title={series.prev_novel.title}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>上一篇</span>
            </a>
          ) : (
            <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-2 rounded-lg bg-muted text-xs md:text-sm text-foreground/30 font-semibold">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>上一篇</span>
            </div>
          )}
        </div>

        <div className="text-center text-[10px] md:text-sm text-foreground/50 truncate max-w-[35%] md:max-w-[40%] font-semibold">
          <span className="hidden md:inline">系列: </span>{series.title}
        </div>

        <div className="flex-1 text-right min-w-0">
          {series.next_novel ? (
            <a
              href={`/novel/${series.next_novel.id}`}
              className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-2 rounded-lg bg-white border border-border hover:border-primary hover:bg-primary/5 text-xs md:text-sm text-foreground font-semibold min-h-[44px] touch-manipulation transition-all"
              title={series.next_novel.title}
            >
              <span>下一篇</span>
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          ) : (
            <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-2 rounded-lg bg-muted text-xs md:text-sm text-foreground/30 font-semibold">
              <span>下一篇</span>
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
