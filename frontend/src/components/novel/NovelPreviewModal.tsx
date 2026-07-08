import { useNavigate } from 'react-router-dom'
import Modal from '../common/Modal'
import NovelDetailContent from './NovelDetailContent'
import NovelPreviewActions from './NovelPreviewActions'
import { Novel } from '../../types/novel'
import { type NovelKeywordMatchResult } from '../../types/search'
import { useI18n } from '../../i18n/useI18n'
import {
  openAppPathInNewTab,
} from '../../utils/appNavigation'
import { buildNovelPreviewModalViewModel } from './novelPreviewModel'

export interface NovelPreviewModalProps {
  novel: Novel | null
  isOpen: boolean
  onClose: () => void
  keywordMatch?: NovelKeywordMatchResult
  onRevealBlocked?: (novelId: string) => void
  highlightWords?: string[]
}

export default function NovelPreviewModal({
  novel,
  isOpen,
  onClose,
  keywordMatch,
  onRevealBlocked,
  highlightWords,
}: NovelPreviewModalProps) {
  const { locale, t, formatNumber } = useI18n()
  const navigate = useNavigate()

  if (!novel) return null

  const viewModel = buildNovelPreviewModalViewModel({
    novelId: novel.id,
    keywordMatch,
  })

  const handleReadNowInCurrentTab = () => {
    navigate(viewModel.novelPath)
    onClose()
  }

  const handleOpenInNewTab = () => {
    openAppPathInNewTab(viewModel.novelPath)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex h-[78vh] md:h-[72vh] flex-col">
        <div className="relative min-h-0 flex-1 overflow-y-auto pr-1 md:pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
          <div
            className={viewModel.contentClassName}
            aria-hidden={viewModel.isContentHiddenFromAssistiveTech}
          >
            <NovelDetailContent
              novel={novel}
              locale={locale}
              t={t}
              formatNumber={formatNumber}
              onNavigateAuthor={(authorId) => {
                openAppPathInNewTab(viewModel.authorPath(authorId))
                onClose()
              }}
              onNavigateSeries={(seriesId) => {
                openAppPathInNewTab(viewModel.seriesPath(seriesId))
                onClose()
              }}
              highlightWords={highlightWords}
            />
          </div>
          {viewModel.isBlockedForDisplay && (
            <button
              type="button"
              aria-label={t('search.keywordRules.reveal')}
              className="absolute inset-0 z-10 flex items-center justify-center p-4 md:p-6 bg-background/65 hover:bg-background/75 transition-colors"
              onClick={() => onRevealBlocked?.(novel.id)}
            >
              <span className="max-w-full rounded-lg border border-primary/25 bg-white/95 px-4 py-3 text-center shadow-sm">
                <span className="block text-xs md:text-sm font-bold text-foreground/80 break-words">
                  {t('search.keywordRules.blockReasonPrefix')} {viewModel.blockedHits.join(', ')}
                </span>
                <span className="mt-1.5 block text-[11px] md:text-xs font-semibold text-primary uppercase tracking-wide">
                  {t('search.keywordRules.reveal')}
                </span>
              </span>
            </button>
          )}
        </div>

        <NovelPreviewActions
          closeLabel={t('preview.close')}
          readNowLabel={t('preview.readNow')}
          openCurrentTabLabel={t('preview.openCurrentTab')}
          openNewTabLabel={t('preview.openNewTab')}
          onClose={onClose}
          onOpenCurrentTab={handleReadNowInCurrentTab}
          onOpenNewTab={handleOpenInNewTab}
        />
      </div>
    </Modal>
  )
}
