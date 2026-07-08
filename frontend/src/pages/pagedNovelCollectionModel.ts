import type { Novel } from '../types/novel'
import { getErrorMessage } from '../utils/errorLog'
import { normalizeOptionalPage } from '../utils/pageInput'
import { formatCountTemplate } from '../utils/textTemplate'

interface PagedCollectionResourceInput<TResource> {
  resource: TResource
  novels: Novel[]
  page: number
  nextPage?: number | null
  hasMore: boolean
}

interface PagedCollectionSubtitleInput {
  count: number
  loadedTemplate: string
  defaultSubtitle: string
  formatNumber: (value: number) => string
}

interface PagedCollectionDocumentTitleInput {
  resourceTitle?: string | null
  titleSuffix: string
  defaultTitle: string
}

export function buildPagedCollectionResourceResponse<TResource>({
  resource,
  novels,
  page,
  nextPage,
  hasMore,
}: PagedCollectionResourceInput<TResource>) {
  return {
    resource,
    novels,
    page,
    nextPage: normalizeOptionalPage(nextPage),
    hasMore,
  }
}

export function buildPagedCollectionSubtitle({
  count,
  loadedTemplate,
  defaultSubtitle,
  formatNumber,
}: PagedCollectionSubtitleInput) {
  return count > 0
    ? formatCountTemplate({
        template: loadedTemplate,
        count,
        formatNumber,
      })
    : defaultSubtitle
}

export function buildPagedCollectionDocumentTitle({
  resourceTitle,
  titleSuffix,
  defaultTitle,
}: PagedCollectionDocumentTitleInput) {
  const title = resourceTitle?.trim()

  return title ? `${title}${titleSuffix}` : defaultTitle
}

export function buildPagedCollectionLoadErrorMessage(error: unknown, fallbackMessage: string) {
  return getErrorMessage(error, fallbackMessage)
}
