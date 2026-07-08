import { type NovelKeywordMatchResult } from '../../types/search'
import { stripHtmlToPlainText } from '../../utils/htmlText'

export function getPlainNovelDescription(html: string): string {
  return stripHtmlToPlainText(html)
}

export function shouldShowModalOnlyBadge(keywordMatch?: NovelKeywordMatchResult): boolean {
  return Boolean(keywordMatch?.hasModalOnlyHighlight && !keywordMatch?.hasCardHighlight)
}
