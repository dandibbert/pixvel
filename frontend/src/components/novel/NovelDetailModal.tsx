import { NovelDetail } from '../../types/novel'
import { useI18n } from '../../i18n/useI18n'

interface NovelDetailModalProps {
  novel: NovelDetail
  isOpen: boolean
  onClose: () => void
}

export default function NovelDetailModal({ novel, isOpen, onClose }: NovelDetailModalProps) {
  const { t } = useI18n()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="sticky top-0 bg-white border-b border-muted p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">{t('reader.novelDetails')}</h2>
          <button
            onClick={onClose}
            className="text-foreground/40 hover:text-foreground p-2 rounded-lg hover:bg-muted transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content area */}
        <div className="p-6 space-y-6">
          {/* Cover and basic info */}
          <div className="flex gap-4">
            {novel.coverUrl && (
              <img
                src={novel.coverUrl}
                alt={novel.title}
                className="w-32 h-32 object-cover rounded-lg border-2 border-muted"
              />
            )}
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-bold">{novel.title}</h3>
              <p className="text-sm text-foreground/60">{novel.author.name}</p>
              <div className="flex gap-4 text-sm text-foreground/60">
                <span>📖 {novel.textLength?.toLocaleString()} {t('common.characters')}</span>
                <span>❤️ {novel.bookmarkCount?.toLocaleString()}</span>
                <span>👁️ {novel.viewCount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {novel.description && (
            <div>
              <h4 className="font-bold mb-2">{t('common.description')}</h4>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{novel.description}</p>
            </div>
          )}

          {/* Tags */}
          {novel.tags && novel.tags.length > 0 && (
            <div>
              <h4 className="font-bold mb-2">{t('common.tags')}</h4>
              <div className="flex flex-wrap gap-2">
                {novel.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-muted text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Creation date */}
          {novel.createDate && (
            <div className="text-sm text-foreground/60">
              {t('common.created')}: {new Date(novel.createDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

