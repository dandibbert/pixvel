interface StripHtmlToPlainTextOptions {
  tagReplacement?: string
  collapseWhitespace?: boolean
}

export function stripHtmlToPlainText(
  html: string,
  {
    tagReplacement = '',
    collapseWhitespace = false,
  }: StripHtmlToPlainTextOptions = {},
): string {
  const text = html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, tagReplacement)

  return (collapseWhitespace ? text.replace(/\s+/g, ' ') : text).trim()
}
