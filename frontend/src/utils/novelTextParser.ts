export interface ParsedElement {
  type: 'text' | 'chapter' | 'image' | 'ruby' | 'link' | 'jump'
  content: string
  metadata?: {
    imageId?: string
    rubyBase?: string
    rubyText?: string
    linkUrl?: string
    linkText?: string
    jumpPage?: number
  }
}

type NovelTextPattern = {
  regex: RegExp
  handler: (match: RegExpMatchArray) => ParsedElement
}

function parseJumpPage(value: string): number {
  return Number(value)
}

const NOVEL_TEXT_PATTERNS: NovelTextPattern[] = [
  {
    regex: /\[chapter:([^\]]+)\]/,
    handler: (match) => ({
      type: 'chapter',
      content: match[1],
    }),
  },
  {
    regex: /\[pixivimage:(\d+)(?:-\d+)?\]/,
    handler: (match) => ({
      type: 'image',
      content: '',
      metadata: { imageId: match[1] },
    }),
  },
  {
    regex: /\[uploadedimage:(\d+)\]/,
    handler: (match) => ({
      type: 'image',
      content: '',
      metadata: { imageId: match[1] },
    }),
  },
  {
    regex: /\[\[rb:([^>]+)>([^\]]+)\]\]/,
    handler: (match) => ({
      type: 'ruby',
      content: '',
      metadata: { rubyBase: match[1], rubyText: match[2] },
    }),
  },
  {
    regex: /\[\[jumpuri:([^>]+)>\s*([^\]]+)\]\]/,
    handler: (match) => ({
      type: 'link',
      content: '',
      metadata: { linkText: match[1], linkUrl: match[2] },
    }),
  },
  {
    regex: /\[jump:(\d+)\]/,
    handler: (match) => ({
      type: 'jump',
      content: '',
      metadata: { jumpPage: parseJumpPage(match[1]) },
    }),
  },
]

export function splitByNewpage(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return ['']
  }
  const pages = text.split('[newpage]')
  return pages.filter(page => page.trim().length > 0)
}

export function parseNovelText(text: string): ParsedElement[] {
  const elements: ParsedElement[] = []
  let remainingText = text

  while (remainingText.length > 0) {
    let earliestMatch: {
      index: number
      match: RegExpMatchArray
      pattern: NovelTextPattern
    } | null = null

    for (const pattern of NOVEL_TEXT_PATTERNS) {
      const match = remainingText.match(pattern.regex)
      if (match && match.index !== undefined) {
        if (!earliestMatch || match.index < earliestMatch.index) {
          earliestMatch = { index: match.index, match, pattern }
        }
      }
    }

    if (earliestMatch) {
      if (earliestMatch.index > 0) {
        elements.push({
          type: 'text',
          content: remainingText.slice(0, earliestMatch.index),
        })
      }

      elements.push(earliestMatch.pattern.handler(earliestMatch.match))
      remainingText = remainingText.slice(earliestMatch.index + earliestMatch.match[0].length)
    } else {
      if (remainingText.length > 0) {
        elements.push({
          type: 'text',
          content: remainingText,
        })
      }
      break
    }
  }

  return elements
}
