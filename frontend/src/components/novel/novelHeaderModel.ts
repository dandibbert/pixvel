import { buildAuthorPath } from '../../utils/appNavigation'

const HEADER_HIDE_SCROLL_Y = 100
const VISIBLE_HEADER_CLASS_NAME = 'translate-y-0'
const HIDDEN_HEADER_CLASS_NAME = '-translate-y-full'

interface HeaderVisibilityInput {
  scrollY: number
  lastScrollY: number
}

interface HeaderScrollState {
  isVisible: boolean
  lastScrollY: number
}

interface NovelHeaderViewModelInput {
  authorId: string
  isVisible: boolean
  canDownload: boolean
  downloadTitle?: string
  hasRefreshAction: boolean
  hasDownloadAction: boolean
}

export function shouldShowNovelHeader({
  scrollY,
  lastScrollY,
}: HeaderVisibilityInput): boolean {
  return !(scrollY > lastScrollY && scrollY > HEADER_HIDE_SCROLL_Y)
}

export function buildNovelHeaderScrollState({
  scrollY,
  lastScrollY,
}: HeaderVisibilityInput): HeaderScrollState {
  return {
    isVisible: shouldShowNovelHeader({ scrollY, lastScrollY }),
    lastScrollY: scrollY,
  }
}

export function buildNovelHeaderViewModel({
  authorId,
  isVisible,
  canDownload,
  downloadTitle,
  hasRefreshAction,
  hasDownloadAction,
}: NovelHeaderViewModelInput) {
  return {
    authorPath: buildAuthorPath(authorId),
    visibilityClassName: isVisible ? VISIBLE_HEADER_CLASS_NAME : HIDDEN_HEADER_CLASS_NAME,
    showRefreshAction: hasRefreshAction,
    showDownloadAction: hasDownloadAction,
    isDownloadDisabled: !canDownload,
    downloadTitle,
  }
}
