import type { Novel, NovelPage } from '../types/novel'

const ILLEGAL_FILENAME_CHARACTERS = /[\\/:*?"<>|]/g
const EMPTY_NOVEL_DOWNLOAD_ERROR = 'ERR_EMPTY_NOVEL_DOWNLOAD'

function sanitizeFilenameSegment(segment?: string): string {
  return segment?.replace(ILLEGAL_FILENAME_CHARACTERS, '_').trim() ?? ''
}

export function buildNovelTxtContent(pages: NovelPage[]): string {
  return pages.map((page) => page.content).join('\n\n')
}

export function buildNovelTxtFilename(novel: Novel): string {
  const segments = [
    sanitizeFilenameSegment(novel.author.name),
    sanitizeFilenameSegment(novel.title),
    sanitizeFilenameSegment(novel.series?.title),
  ].filter((segment) => segment.length > 0)

  return `${segments.join('-')}.txt`
}

export function downloadNovelTxt(novel: Novel, pages: NovelPage[]): void {
  const content = buildNovelTxtContent(pages)
  const hasNonEmptyPageContent = pages.some((page) => page.content.trim().length > 0)

  if (!hasNonEmptyPageContent) {
    throw new Error(EMPTY_NOVEL_DOWNLOAD_ERROR)
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = buildNovelTxtFilename(novel)
  link.style.display = 'none'

  try {
    document.body.appendChild(link)
    link.click()
  } finally {
    try {
      if (link.parentNode === document.body) {
        document.body.removeChild(link)
      }
    } finally {
      URL.revokeObjectURL(url)
    }
  }
}
