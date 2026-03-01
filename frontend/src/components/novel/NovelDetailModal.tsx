import { NovelDetail } from '../../types/novel'
import { useI18n } from '../../i18n/useI18n'
import NovelDetailContent from './NovelDetailContent'

interface NovelDetailModalProps {
  novel: NovelDetail
  isOpen: boolean
  onClose: () => void
}

export default function NovelDetailModal({ novel, isOpen, onClose }: NovelDetailModalProps) {
  const { locale, t, formatNumber } = useI18n()

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

        <div className="p-6">
          <NovelDetailContent
            novel={novel}
            locale={locale}
            t={t}
            formatNumber={formatNumber}
            statsMode="reader"
            showCover
          />
        </div>
      </div>
    </div>
  )
}

