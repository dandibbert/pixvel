import { parseNovelText, ParsedElement } from '../../utils/novelTextParser'
import { openAppPathInNewTab } from '../../utils/appNavigation'
import {
  buildJumpPageLabel,
  resolveNovelContentLinkTarget,
} from './novelContentModel'

interface NovelContentProps {
  content: string
  onJumpToPage?: (page: number) => void
}

export default function NovelContent({ content, onJumpToPage }: NovelContentProps) {
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

      case 'link': {
        const linkUrl = element.metadata?.linkUrl || ''
        const linkTarget = resolveNovelContentLinkTarget(linkUrl)

        if (linkTarget.type === 'app-novel') {
          return (
            <a
              key={index}
              href={linkUrl}
              onClick={(e) => {
                e.preventDefault()
                openAppPathInNewTab(linkTarget.href)
              }}
              className="text-pixiv-blue underline hover:text-blue-600 break-words cursor-pointer"
            >
              {element.metadata?.linkText}
            </a>
          )
        }

        return (
          <a
            key={index}
            href={linkTarget.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pixiv-blue underline hover:text-blue-600 break-words"
          >
            {element.metadata?.linkText}
          </a>
        )
      }

      case 'jump':
        if (!onJumpToPage || !element.metadata?.jumpPage) {
          return <span key={index}>{buildJumpPageLabel(element.metadata?.jumpPage)}</span>
        }
        return (
          <button
            key={index}
            className="text-pixiv-blue underline hover:text-blue-600 cursor-pointer bg-transparent border-none p-0 font-inherit"
            onClick={() => onJumpToPage(element.metadata!.jumpPage!)}
          >
            {buildJumpPageLabel(element.metadata.jumpPage)}
          </button>
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
