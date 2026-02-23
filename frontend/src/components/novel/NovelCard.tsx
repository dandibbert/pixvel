import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/useI18n'
import { Novel } from '../../types/novel'

interface NovelCardProps {
  novel: Novel
  onClick: () => void
}

export default function NovelCard({ novel, onClick }: NovelCardProps) {
  const navigate = useNavigate()
  const { t, formatNumber } = useI18n()

  const getPlainDescription = (html: string) => {
    return html
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .trim()
  }

  const plainDescription = getPlainDescription(novel.description)
  const seriesPrefix = t('novel.seriesPrefix')

  return (
    <div
      onClick={onClick}
      className="bg-white border border-border/50 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer touch-manipulation group flex flex-col h-full hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
    >
      <div className="p-3 md:p-4 flex flex-col gap-2 md:gap-3 h-full">
        <div className="flex-shrink-0 space-y-1.5 md:space-y-2">
          <div className="h-[20px] md:h-[24px] flex items-center">
            {novel.series?.title && novel.series.id ? (
              <button
                type="button"
                className="max-w-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white bg-primary/90 px-2 py-0.5 md:py-1 rounded shadow-sm truncate hover:bg-primary transition-all"
                title={`${seriesPrefix}: ${novel.series.title}`}
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/series/${novel.series?.id}`)
                }}
              >
                {seriesPrefix}: {novel.series.title}
              </button>
            ) : null}
          </div>
          <h3 className="text-sm md:text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-[1.3] tracking-tight overflow-hidden">
            {novel.title}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 h-[1.25rem]">
            <span
              className="text-[10px] md:text-[11px] font-semibold text-primary/80 hover:text-primary transition-all cursor-pointer truncate"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/author/${novel.author.id}`)
              }}
            >
              {novel.author.name}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 md:gap-1.5 h-[2.5rem] md:h-[3rem] flex-shrink-0 content-start overflow-hidden">
          {novel.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 md:px-2 py-0.5 bg-muted text-foreground/60 text-[10px] md:text-[11px] rounded font-medium hover:bg-primary/10 hover:text-primary transition-all h-fit"
            >
              #{tag}
            </span>
          ))}
          {novel.tags.length > 3 && (
             <span className="px-1 md:px-1.5 py-0.5 text-foreground/30 text-[10px] md:text-[11px] font-medium h-fit">+{novel.tags.length - 3}</span>
          )}
        </div>

        <p className="text-xs text-foreground/50 line-clamp-2 leading-relaxed flex-shrink-0 h-[2.4rem]">
          {plainDescription || t('novel.emptyDescription')}
        </p>

        <div className="flex items-center justify-between pt-2 md:pt-3 mt-auto border-t border-muted flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-[11px] font-medium text-foreground/40">
             <span className="flex items-center gap-1 group-hover:text-primary transition-colors" title={t('novel.bookmarksTooltip')}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-3.5 md:w-3.5" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
               </svg>
               {formatNumber(novel.totalBookmarks)}
             </span>
             <span className="flex items-center gap-1" title={t('novel.wordCountTooltip')}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-3.5 md:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
               </svg>
               {formatNumber(novel.textLength)}
             </span>
          </div>
          <span className="text-foreground/30 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
            {novel.pageCount}P
          </span>
        </div>
      </div>
    </div>
  )
}
