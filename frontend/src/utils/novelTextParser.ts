export interface ParsedElement {
  type: 'text' | 'chapter' | 'image' | 'ruby' | 'link'
  content: string
  metadata?: {
    imageId?: string
    rubyBase?: string
    rubyText?: string
    linkUrl?: string
    linkText?: string
  }
}

export function splitByNewpage(text: string): string[] {
  if (!text || typeof text !== 'string') {
    console.error('splitByNewpage received invalid text:', text);
    return ['']
  }
  const pages = text.split('[newpage]')
  return pages.filter(page => page.trim().length > 0)
}

export function parseNovelText(text: string): ParsedElement[] {
  const elements: ParsedElement[] = []
  let remainingText = text

  const patterns = [
    {
      regex: /\[chapter:([^\]]+)\]/,
      type: 'chapter' as const,
      handler: (match: RegExpMatchArray) => ({
        type: 'chapter' as const,
        content: match[1],
      }),
    },
    {
      regex: /\[pixivimage:(\d+)(?:-\d+)?\]/,
      type: 'image' as const,
      handler: (match: RegExpMatchArray) => ({
        type: 'image' as const,
        content: '',
        metadata: { imageId: match[1] },
      }),
    },
    {
      regex: /\[uploadedimage:(\d+)\]/,
      type: 'image' as const,
      handler: (match: RegExpMatchArray) => ({
        type: 'image' as const,
        content: '',
        metadata: { imageId: match[1] },
      }),
    },
    {
      regex: /\[\[rb:([^>]+)>([^\]]+)\]\]/,
      type: 'ruby' as const,
      handler: (match: RegExpMatchArray) => ({
        type: 'ruby' as const,
        content: '',
        metadata: { rubyBase: match[1], rubyText: match[2] },
      }),
    },
    {
      regex: /\[\[jumpuri:([^>]+)>\s*([^\]]+)\]\]/,
      type: 'link' as const,
      handler: (match: RegExpMatchArray) => ({
        type: 'link' as const,
        content: '',
        metadata: { linkText: match[1], linkUrl: match[2] },
      }),
    },
  ]

  while (remainingText.length > 0) {
    let earliestMatch: { index: number; match: RegExpMatchArray; pattern: typeof patterns[0] } | null = null

    for (const pattern of patterns) {
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
