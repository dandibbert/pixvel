import { splitHighlightedText } from '../../utils/textHighlight'

interface HighlightedTextProps {
  text: string
  highlightWords: ReadonlyArray<string>
  className: string
}

export default function HighlightedText({
  text,
  highlightWords,
  className,
}: HighlightedTextProps) {
  const segments = splitHighlightedText(text, highlightWords)

  if (segments.length === 0 || segments.every((segment) => !segment.isHighlighted)) {
    return <>{text}</>
  }

  return (
    <>
      {segments.map((segment, index) => {
        if (!segment.isHighlighted) {
          return <span key={`${segment.text}-${index}`}>{segment.text}</span>
        }

        return (
          <span key={`${segment.text}-${index}`} className={className}>
            {segment.text}
          </span>
        )
      })}
    </>
  )
}
