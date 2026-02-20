import { Novel } from '../../types/novel'
import NovelCard from './NovelCard'

interface NovelGridProps {
  novels: Novel[]
  onNovelClick: (novel: Novel) => void
}

export default function NovelGrid({ novels, onNovelClick }: NovelGridProps) {
  if (novels.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">暂无结果</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
      {novels.map((novel) => (
        <NovelCard
          key={novel.id}
          novel={novel}
          onClick={() => onNovelClick(novel)}
        />
      ))}
    </div>
  )
}
