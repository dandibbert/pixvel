import { type NovelKeywordMatchResult } from '../../types/search'
import {
  buildAuthorPath,
  buildNovelPath,
  buildSeriesPath,
} from '../../utils/appNavigation'

const BLOCKED_CONTENT_CLASS_NAME = 'pointer-events-none blur-[3px]'

interface NovelPreviewModalViewModelInput {
  novelId: string
  keywordMatch?: NovelKeywordMatchResult
}

export function buildNovelPreviewModalViewModel({
  novelId,
  keywordMatch,
}: NovelPreviewModalViewModelInput) {
  const isBlockedForDisplay = keywordMatch?.isBlocked ?? false

  return {
    novelPath: buildNovelPath(novelId),
    authorPath: buildAuthorPath,
    seriesPath: buildSeriesPath,
    isBlockedForDisplay,
    blockedHits: keywordMatch?.blockedHits ?? [],
    contentClassName: isBlockedForDisplay ? BLOCKED_CONTENT_CLASS_NAME : '',
    isContentHiddenFromAssistiveTech: isBlockedForDisplay,
  }
}
