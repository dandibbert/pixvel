import DOMPurify from 'dompurify'
import { type ReactNode } from 'react'
import { Novel, NovelDetail } from '../../types/novel'
import { Locale } from '../../stores/localeStore'

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

function getFirstChar(str: string) {
  const match = str.match(/./u)
  return match ? match[0] : str.charAt(0)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeKeyword(value: string): string {
  return value.trim().toLocaleLowerCase()
}

const MAX_HIGHLIGHT_TERMS = 20
const MAX_HIGHLIGHT_TERM_LENGTH = 64

function buildHighlightWords(words: ReadonlyArray<string>): string[] {
  const seen = new Set<string>()
  const deduped: string[] = []

  for (const word of words) {
    const trimmed = word.trim()
    if (trimmed.length === 0) continue
    if (trimmed.length > MAX_HIGHLIGHT_TERM_LENGTH) continue

    const normalized = normalizeKeyword(trimmed)
    if (seen.has(normalized)) continue

    seen.add(normalized)
    deduped.push(trimmed)

    if (deduped.length >= MAX_HIGHLIGHT_TERMS) {
      break
    }
  }

  return deduped.sort((a, b) => b.length - a.length)
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
  const hasSeries = Boolean(novel.series?.id && novel.series.title)
  const tags = novel.tags ?? []
  const totalBookmarks = novel.totalBookmarks ?? 0
  const totalViews = novel.totalViews ?? 0
  const textLength = novel.textLength ?? 0
  const sanitizedDescription = DOMPurify.sanitize(novel.description ?? '')
  const descriptionClassName = statsMode === 'reader'
    ? 'text-foreground/70 leading-relaxed text-sm md:text-base bg-muted/30 p-4 md:p-6 rounded-lg whitespace-pre-wrap break-words overflow-wrap-anywhere'
    : 'text-foreground/70 leading-relaxed text-sm md:text-base bg-muted/30 p-4 md:p-6 rounded-lg break-words overflow-wrap-anywhere'
  const highlightTerms = buildHighlightWords(highlightWords ?? [])
  const highlightLookup = new Set(highlightTerms.map((word) => normalizeKeyword(word)))
  const highlightClassName = 'px-0.5 rounded bg-primary/15 text-primary font-semibold'

  const renderHighlightedText = (text: string): ReactNode => {
    if (!text || highlightTerms.length === 0) {
      return text
    }

    const pattern = new RegExp(`(${highlightTerms.map(escapeRegExp).join('|')})`, 'gi')
    const parts = text.split(pattern)

    return parts.map((part, index) => {
      if (!part) return null

      if (!highlightLookup.has(normalizeKeyword(part))) {
        return <span key={`${part}-${index}`}>{part}</span>
      }

      return (
        <span key={`${part}-${index}`} className={highlightClassName}>
          {part}
        </span>
      )
    })
  }

  const authorAvatar = (
    <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-lg flex items-center justify-center font-bold text-primary text-lg md:text-xl">
      {getFirstChar(novel.author.name)}
    </div>
  )

  const authorName = (
    <p className="font-bold text-foreground text-base md:text-lg">{renderHighlightedText(novel.author.name)}</p>
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
            <div className="flex items-center space-x-3 md:space-x-4 mb-6">
              {onNavigateAuthor ? (
                <button
                  type="button"
                  className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-lg flex items-center justify-center font-bold text-primary text-lg md:text-xl hover:scale-105 transition-transform"
                  onClick={() => onNavigateAuthor(novel.author.id)}
                >
                  {getFirstChar(novel.author.name)}
                </button>
              ) : (
                authorAvatar
              )}
              <div>
                {onNavigateAuthor ? (
                  <button
                    type="button"
                    className="font-bold text-foreground text-base md:text-lg hover:text-primary transition-colors"
                    onClick={() => onNavigateAuthor(novel.author.id)}
                  >
                    {renderHighlightedText(novel.author.name)}
                  </button>
                ) : (
                  authorName
                )}
                <p className="text-xs md:text-sm font-semibold text-foreground/40">
                  {new Date(novel.createdAt).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'zh-CN')}
                </p>
              </div>
            </div>

            {statsMode === 'reader' ? (
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
              </div>
            ) : (
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
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-bold">
                  {novel.pageCount}P
                </span>
              </div>
            )}
          </div>
        </div>

        {hasSeries && (
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

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6">
            {tags.map((tag) => (
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
          className={descriptionClassName}
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
      </div>
    </div>
  )
}
