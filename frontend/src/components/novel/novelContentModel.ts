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
  | {
    type: 'plain-text'
    href: null
  }

/** Novel text is untrusted; only http(s) may become a live link. */
function isSafeExternalUrl(linkUrl: string): boolean {
  try {
    const protocol = new URL(linkUrl).protocol
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export function resolveNovelContentLinkTarget(linkUrl: string): NovelContentLinkTarget {
  const novelId = extractPixivNovelId(linkUrl)

  if (novelId) {
    return {
      type: 'app-novel',
      href: buildNovelPath(novelId),
    }
  }

  if (!isSafeExternalUrl(linkUrl)) {
    return {
      type: 'plain-text',
      href: null,
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
