import { NovelKeywordMatchResult } from '../../types/search'
import { Novel } from '../../types/novel'
import NovelCard from './NovelCard'
import { useI18n } from '../../i18n/useI18n'

interface NovelGridProps {
  novels: Novel[]
  onNovelClick: (novel: Novel) => void
  keywordMatchMap?: Readonly<Record<string, NovelKeywordMatchResult>>
  onRevealBlocked?: (novelId: string) => void
}

export default function NovelGrid({
  novels,
  onNovelClick,
  keywordMatchMap,
  onRevealBlocked,
}: NovelGridProps) {
  const { t } = useI18n()

  if (novels.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('novelGrid.empty')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
      {novels.map((novel) => {
        const match = keywordMatchMap?.[novel.id]

        return (
          <NovelCard
            key={novel.id}
            novel={novel}
            keywordMatch={match}
            onRevealBlocked={onRevealBlocked}
            onClick={() => {
              if (match?.isBlocked) {
                return
              }
              onNovelClick(novel)
            }}
          />
        )
      })}
    </div>
  )
}
