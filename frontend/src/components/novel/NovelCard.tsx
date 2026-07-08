import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/useI18n'
import { Novel } from '../../types/novel'
import { type NovelKeywordMatchResult } from '../../types/search'
import { buildAuthorPath, buildSeriesPath } from '../../utils/appNavigation'
import HighlightedText from '../common/HighlightedText'
import NovelCardFooter from './NovelCardFooter'
import { getPlainNovelDescription, shouldShowModalOnlyBadge } from './novelCardModel'
import NovelCardTags from './NovelCardTags'

interface NovelCardProps {
  novel: Novel
  onClick: () => void
  keywordMatch?: NovelKeywordMatchResult
  onRevealBlocked?: (novelId: string) => void
}

export default function NovelCard({
  novel,
  onClick,
  keywordMatch,
  onRevealBlocked,
}: NovelCardProps) {
  const navigate = useNavigate()
  const { t, formatNumber } = useI18n()

  const plainDescription = getPlainNovelDescription(novel.description)
  const seriesPrefix = t('novel.seriesPrefix')
  const series = novel.series?.title && novel.series.id ? novel.series : null
  const isBlockedForDisplay = keywordMatch?.isBlocked ?? false
  const blockedHits = keywordMatch?.blockedHits ?? []
  const highlightWords = keywordMatch?.highlightHits ?? []
  const showModalOnlyBadge = shouldShowModalOnlyBadge(keywordMatch)
  const highlightClassName = 'px-0.5 rounded bg-primary/15 text-primary font-semibold'

  const renderHighlightedText = (text: string) => (
    <HighlightedText text={text} highlightWords={highlightWords} className={highlightClassName} />
  )

  return (
    <div
      className="relative w-full text-left bg-white border border-border/50 rounded-xl overflow-hidden transition-all duration-200 touch-manipulation group flex flex-col h-full hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <button
        type="button"
        aria-label={novel.title}
        onClick={onClick}
        disabled={isBlockedForDisplay}
        className="absolute inset-0 z-[1] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      />
      <div
        className={`relative z-[2] p-3 md:p-4 flex flex-col gap-2 md:gap-3 h-full pointer-events-none ${isBlockedForDisplay ? 'blur-[2px]' : ''}`}
      >
        <div className="flex-shrink-0 space-y-1.5 md:space-y-2">
          <div className="h-[20px] md:h-[24px] flex items-center justify-between gap-2">
            {series ? (
              <button
                type="button"
                className="relative z-[4] pointer-events-auto max-w-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white bg-primary/90 px-2 py-0.5 md:py-1 rounded shadow-sm truncate hover:bg-primary transition-all"
                title={`${seriesPrefix}: ${series.title}`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (isBlockedForDisplay) return
                  navigate(buildSeriesPath(series.id))
                }}
              >
                {seriesPrefix}: {renderHighlightedText(series.title)}
              </button>
            ) : (
              <span />
            )}

            {showModalOnlyBadge && (
              <span
                className="relative z-[3] px-1.5 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded"
                title={t('search.keywordRules.modalOnlyHighlight')}
              >
                {t('search.keywordRules.badge')}
              </span>
            )}
          </div>
          <h3 className="text-sm md:text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-[1.3] tracking-tight overflow-hidden">
            {renderHighlightedText(novel.title)}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 h-[1.25rem]">
            <button
              type="button"
              className="relative z-[4] pointer-events-auto text-[10px] md:text-[11px] font-semibold text-primary/80 hover:text-primary transition-all truncate"
              onClick={(e) => {
                e.stopPropagation()
                if (isBlockedForDisplay) return
                navigate(buildAuthorPath(novel.author.id))
              }}
            >
              {renderHighlightedText(novel.author.name)}
            </button>
          </div>
        </div>

        <NovelCardTags tags={novel.tags} renderText={renderHighlightedText} />

        <p className="text-xs text-foreground/50 line-clamp-2 leading-relaxed flex-shrink-0 h-[2.4rem]">
          {renderHighlightedText(plainDescription || t('novel.emptyDescription'))}
        </p>

        <NovelCardFooter
          totalBookmarks={novel.totalBookmarks}
          textLength={novel.textLength}
          pageCount={novel.pageCount}
          bookmarksTitle={t('novel.bookmarksTooltip')}
          wordCountTitle={t('novel.wordCountTooltip')}
          formatNumber={formatNumber}
        />
      </div>

      {isBlockedForDisplay && (
        <button
          type="button"
          className="absolute inset-0 z-10 flex items-center justify-center p-3 md:p-4 bg-background/65 hover:bg-background/75 transition-colors"
          onClick={(event) => {
            event.stopPropagation()
            onRevealBlocked?.(novel.id)
          }}
        >
          <span className="max-w-full rounded-lg border border-primary/25 bg-white/95 px-3 py-2 text-center shadow-sm">
            <span className="block text-[10px] md:text-xs font-bold text-foreground/80 line-clamp-2">
              {t('search.keywordRules.blockReasonPrefix')} {blockedHits.join(', ')}
            </span>
            <span className="mt-1 block text-[10px] md:text-[11px] font-semibold text-primary uppercase tracking-wide">
              {t('search.keywordRules.reveal')}
            </span>
          </span>
        </button>
      )}
    </div>
  )
}
