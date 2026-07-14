import { type ReactNode } from 'react'

interface NovelCardTagsProps {
  tags: ReadonlyArray<string>
  renderText: (text: string) => ReactNode
}

export default function NovelCardTags({ tags, renderText }: NovelCardTagsProps) {
  const visibleTags = tags.slice(0, 3)
  const hiddenTagCount = tags.length - visibleTags.length

  return (
    <div className="flex flex-wrap gap-1 md:gap-1.5 min-h-[1.5rem] md:h-[3rem] flex-shrink-0 content-start overflow-hidden">
      {visibleTags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="px-1.5 md:px-2 py-0.5 bg-muted text-foreground/60 text-[10px] md:text-[11px] rounded font-medium hover:bg-primary/10 hover:text-primary transition-all h-fit"
        >
          #{renderText(tag)}
        </span>
      ))}
      {hiddenTagCount > 0 && (
        <span className="px-1 md:px-1.5 py-0.5 text-foreground/30 text-[10px] md:text-[11px] font-medium h-fit">
          +{hiddenTagCount}
        </span>
      )}
    </div>
  )
}
