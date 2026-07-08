import { type ReactNode } from 'react'
import { type Locale } from '../../stores/localeStore'
import { type Novel } from '../../types/novel'
import { formatNovelCreatedDate, getFirstChar } from './novelDetailModel'

interface NovelDetailAuthorBlockProps {
  author: Novel['author']
  createdAt: string
  locale: Locale
  renderText: (text: string) => ReactNode
  onNavigateAuthor?: (authorId: string) => void
}

const avatarClassName = 'w-10 h-10 md:w-12 md:h-12 bg-muted rounded-lg flex items-center justify-center font-bold text-primary text-lg md:text-xl'

export default function NovelDetailAuthorBlock({
  author,
  createdAt,
  locale,
  renderText,
  onNavigateAuthor,
}: NovelDetailAuthorBlockProps) {
  const authorInitial = getFirstChar(author.name)
  const createdDate = formatNovelCreatedDate(createdAt, locale)

  return (
    <div className="flex items-center space-x-3 md:space-x-4 mb-6">
      {onNavigateAuthor ? (
        <button
          type="button"
          className={`${avatarClassName} hover:scale-105 transition-transform`}
          onClick={() => onNavigateAuthor(author.id)}
        >
          {authorInitial}
        </button>
      ) : (
        <div className={avatarClassName}>
          {authorInitial}
        </div>
      )}
      <div>
        {onNavigateAuthor ? (
          <button
            type="button"
            className="font-bold text-foreground text-base md:text-lg hover:text-primary transition-colors"
            onClick={() => onNavigateAuthor(author.id)}
          >
            {renderText(author.name)}
          </button>
        ) : (
          <p className="font-bold text-foreground text-base md:text-lg">{renderText(author.name)}</p>
        )}
        <p className="text-xs md:text-sm font-semibold text-foreground/40">
          {createdDate}
        </p>
      </div>
    </div>
  )
}
