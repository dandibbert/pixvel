import { NovelSeries } from '../../hooks/useNovelDetail'

interface NovelSeriesNavProps {
  series: NovelSeries | null
}

export default function NovelSeriesNav({ series }: NovelSeriesNavProps) {
  if (!series || (!series.prev_novel && !series.next_novel)) {
    return null
  }

  return (
    <div className="bg-gray-50 border-t border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          {series.prev_novel ? (
            <a
              href={`/novel/${series.prev_novel.id}`}
              className="inline-flex items-center text-xs md:text-sm text-pixiv-blue hover:underline min-h-[44px] touch-manipulation"
              title={series.prev_novel.title}
            >
              <svg
                className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:inline">上一篇</span>
              <span className="sm:hidden">&lt;</span>
            </a>
          ) : (
            <span className="text-xs md:text-sm text-gray-400">
              <span className="hidden sm:inline">无上一篇</span>
              <span className="sm:hidden">-</span>
            </span>
          )}
        </div>

        <div className="text-center text-xs md:text-sm text-gray-600 truncate max-w-[40%]">
          <span className="hidden sm:inline">系列: </span>{series.title}
        </div>

        <div className="flex-1 text-right min-w-0">
          {series.next_novel ? (
            <a
              href={`/novel/${series.next_novel.id}`}
              className="inline-flex items-center text-xs md:text-sm text-pixiv-blue hover:underline min-h-[44px] touch-manipulation"
              title={series.next_novel.title}
            >
              <span className="hidden sm:inline">下一篇</span>
              <span className="sm:hidden">&gt;</span>
              <svg
                className="w-3 h-3 md:w-4 md:h-4 ml-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          ) : (
            <span className="text-xs md:text-sm text-gray-400">
              <span className="hidden sm:inline">无下一篇</span>
              <span className="sm:hidden">-</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
