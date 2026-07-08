import { type Locale } from '../../stores/localeStore'
import { getIntlLocale } from '../../utils/localeFormat'

interface NovelDetailContentSource {
  tags?: string[]
  totalBookmarks?: number
  totalViews?: number
  textLength?: number
  series?: {
    id?: string
    title?: string
  }
}

interface NovelDetailContentViewModelInput {
  novel: NovelDetailContentSource
  statsMode: 'preview' | 'reader'
}

const DESCRIPTION_CLASS_BASE = 'text-foreground/70 leading-relaxed text-sm md:text-base bg-muted/30 p-4 md:p-6 rounded-lg break-words overflow-wrap-anywhere'
const READER_DESCRIPTION_CLASS = 'text-foreground/70 leading-relaxed text-sm md:text-base bg-muted/30 p-4 md:p-6 rounded-lg whitespace-pre-wrap break-words overflow-wrap-anywhere'

export function getFirstChar(str: string) {
  const match = str.match(/./u)
  return match ? match[0] : str.charAt(0)
}

export function formatNovelCreatedDate(createdAt: string, locale: Locale): string {
  return new Date(createdAt).toLocaleDateString(getIntlLocale(locale))
}

export function buildNovelDetailContentViewModel({
  novel,
  statsMode,
}: NovelDetailContentViewModelInput) {
  return {
    hasSeries: Boolean(novel.series?.id && novel.series.title),
    tags: novel.tags ?? [],
    totalBookmarks: novel.totalBookmarks ?? 0,
    totalViews: novel.totalViews ?? 0,
    textLength: novel.textLength ?? 0,
    descriptionClassName: statsMode === 'reader'
      ? READER_DESCRIPTION_CLASS
      : DESCRIPTION_CLASS_BASE,
  }
}

export function extractPixivNovelId(href: string | null): string | null {
  if (!href) return null

  const relativeMatch = href.match(/^novel\/(\d+)$/)
  if (relativeMatch) return relativeMatch[1]

  const pixivSchemeMatch = href.match(/^pixiv:\/\/novels\/(\d+)$/)
  if (pixivSchemeMatch) return pixivSchemeMatch[1]

  try {
    const url = new URL(href)
    const isPixivHost = url.hostname === 'pixiv.net' || url.hostname.endsWith('.pixiv.net')

    if (!isPixivHost) return null

    if (url.pathname.includes('/novel/show.php')) {
      const id = url.searchParams.get('id')
      return id && /^\d+$/.test(id) ? id : null
    }

    const absoluteMatch = url.pathname.match(/\/novel\/(\d+)\/?$/)
    return absoluteMatch ? absoluteMatch[1] : null
  } catch {
    return null
  }
}

export function appendRelTokens(
  rel: string | null | undefined,
  tokens: ReadonlyArray<string>,
) {
  const relValues = new Set((rel ?? '').split(/\s+/).filter(Boolean))

  tokens.forEach((token) => relValues.add(token))

  return Array.from(relValues).join(' ')
}

export function normalizeDescriptionLinks(html: string): string {
  if (!html) return html

  const document = new DOMParser().parseFromString(html, 'text/html')

  document.querySelectorAll('a').forEach((link) => {
    const novelId = extractPixivNovelId(link.getAttribute('href'))

    if (novelId) {
      link.setAttribute('href', `/novel/${novelId}`)
      link.setAttribute('target', '_blank')
    }

    if (link.getAttribute('target') === '_blank') {
      link.setAttribute('rel', appendRelTokens(link.getAttribute('rel'), ['noopener', 'noreferrer']))
    }
  })

  return document.body.innerHTML
}
