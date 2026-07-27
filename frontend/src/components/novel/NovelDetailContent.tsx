import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { Novel, NovelDetail } from '../../types/novel'
import { Locale } from '../../stores/localeStore'
import HighlightedText from '../common/HighlightedText'
import {
  buildNovelDetailContentViewModel,
  normalizeDescriptionLinks,
} from './novelDetailModel'
import NovelStatsRow from './NovelStatsRow'
import NovelDetailAuthorBlock from './NovelDetailAuthorBlock'

interface NovelDetailContentProps {
  novel: Novel | NovelDetail
  locale: Locale
  t: (key: string) => string
  formatNumber: (value: number) => string
  onNavigateAuthor?: (authorId: string) => void
  onNavigateSeries?: (seriesId: string) => void
  statsMode?: 'preview' | 'reader'
  showCover?: boolean
  highlightWords?: string[]
}

export default function NovelDetailContent({
  novel,
  locale,
  t,
  formatNumber,
  onNavigateAuthor,
  onNavigateSeries,
  statsMode = 'preview',
  showCover = false,
  highlightWords,
}: NovelDetailContentProps) {
  const viewModel = buildNovelDetailContentViewModel({
    novel,
    statsMode,
  })
  // DOMParser round trip + sanitize are costly; only redo when the text changes
  const sanitizedDescription = useMemo(
    () =>
      DOMPurify.sanitize(normalizeDescriptionLinks(novel.description ?? ''), {
        ADD_ATTR: ['target'],
      }),
    [novel.description],
  )
  const highlightClassName = 'px-0.5 rounded bg-primary/15 text-primary font-semibold'

  const renderHighlightedText = (text: string) => (
    <HighlightedText
      text={text}
      highlightWords={highlightWords ?? []}
      className={highlightClassName}
    />
  )

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 leading-tight tracking-tight">
          {renderHighlightedText(novel.title)}
        </h2>
        <div className="flex gap-4 mb-6">
          {showCover && novel.coverImage && (
            <img
              src={novel.coverImage}
              alt={novel.title}
              className="w-32 h-32 object-cover rounded-lg border-2 border-muted"
            />
          )}
          <div className="flex-1">
            <NovelDetailAuthorBlock
              author={novel.author}
              createdAt={novel.createdAt}
              locale={locale}
              renderText={renderHighlightedText}
              onNavigateAuthor={onNavigateAuthor}
            />

            <NovelStatsRow
              mode={statsMode}
              textLength={viewModel.textLength}
              totalBookmarks={viewModel.totalBookmarks}
              totalViews={viewModel.totalViews}
              pageCount={novel.pageCount}
              formatNumber={formatNumber}
            />
          </div>
        </div>

        {viewModel.hasSeries && (
          onNavigateSeries ? (
            <button
              type="button"
              className="mb-6 w-full md:w-auto inline-flex items-center gap-3 px-4 py-2.5 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary hover:text-white transition-all"
              onClick={() => onNavigateSeries(novel.series!.id)}
            >
              <span className="uppercase tracking-wider text-[10px]">{t('preview.series')}</span>
              <span className="truncate">{renderHighlightedText(novel.series!.title)}</span>
            </button>
          ) : (
            <div className="mb-6 w-full md:w-auto inline-flex items-center gap-3 px-4 py-2.5 bg-primary/10 text-primary rounded-lg font-bold">
              <span className="uppercase tracking-wider text-[10px]">{t('preview.series')}</span>
              <span className="truncate">{renderHighlightedText(novel.series!.title)}</span>
            </div>
          )
        )}

        {viewModel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6">
            {viewModel.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-muted text-foreground/60 text-xs rounded font-semibold hover:bg-primary/10 hover:text-primary transition-all cursor-default"
              >
                #{renderHighlightedText(tag)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-base md:text-lg font-bold text-foreground mb-3 uppercase tracking-wide">{t('preview.description')}</h3>
        <div
          className={viewModel.descriptionClassName}
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
      </div>
    </div>
  )
}
