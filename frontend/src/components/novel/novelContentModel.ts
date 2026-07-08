import { buildNovelPath } from '../../utils/appNavigation'
import { extractPixivNovelId } from './novelDetailModel'

export type NovelContentLinkTarget =
  | {
    type: 'app-novel'
    href: string
  }
  | {
    type: 'external'
    href: string
  }

export function resolveNovelContentLinkTarget(linkUrl: string): NovelContentLinkTarget {
  const novelId = extractPixivNovelId(linkUrl)

  if (novelId) {
    return {
      type: 'app-novel',
      href: buildNovelPath(novelId),
    }
  }

  return {
    type: 'external',
    href: linkUrl,
  }
}

export function buildJumpPageLabel(page: number | undefined) {
  return `[jump:${page ?? ''}]`
}
