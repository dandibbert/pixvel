import { parseNovelText, ParsedElement } from '../../utils/novelTextParser'

interface NovelContentProps {
  content: string
}

export default function NovelContent({ content }: NovelContentProps) {
  const elements = parseNovelText(content)

  const renderElement = (element: ParsedElement, index: number) => {
    switch (element.type) {
      case 'chapter':
        return (
          <h2 key={index} className="text-xl md:text-2xl font-bold my-3 md:my-4 text-near-black">
            {element.content}
          </h2>
        )

      case 'image':
        return null

      case 'ruby':
        return (
          <ruby key={index}>
            {element.metadata?.rubyBase}
            <rp>(</rp>
            <rt className="text-xs">{element.metadata?.rubyText}</rt>
            <rp>)</rp>
          </ruby>
        )

      case 'link':
        return (
          <a
            key={index}
            href={element.metadata?.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pixiv-blue underline hover:text-blue-600 break-words"
          >
            {element.metadata?.linkText}
          </a>
        )

      case 'text':
        return <span key={index}>{element.content}</span>

      default:
        return null
    }
  }

  return (
    <div
      className="prose prose-sm md:prose-lg max-w-none whitespace-pre-wrap leading-relaxed"
      style={{
        fontFamily: '"Noto Serif JP", serif',
        lineHeight: '1.8',
      }}
    >
      {elements.map((element, index) => renderElement(element, index))}
    </div>
  )
}
