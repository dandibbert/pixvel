import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import Modal from '../common/Modal'
import NovelDetailContent from './NovelDetailContent'
import { Novel } from '../../types/novel'
import { useI18n } from '../../i18n/useI18n'

interface NovelPreviewModalProps {
  novel: Novel | null
  isOpen: boolean
  onClose: () => void
}

export default function NovelPreviewModal({
  novel,
  isOpen,
  onClose,
}: NovelPreviewModalProps) {
  const { locale, t, formatNumber } = useI18n()
  const navigate = useNavigate()
  const [showContextMenu, setShowContextMenu] = useState(false)
  const longPressTimer = useRef<number | null>(null)
  const longPressTriggered = useRef(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  const clearLongPressTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const closeContextMenu = () => {
    setShowContextMenu(false)
    longPressTriggered.current = false
  }

  useEffect(() => {
    if (!isOpen) {
      setShowContextMenu(false)
      clearLongPressTimer()
      longPressTriggered.current = false
    }

    return () => {
      clearLongPressTimer()
    }
  }, [isOpen])

  if (!novel) return null

  const handleReadNowInCurrentTab = () => {
    closeContextMenu()
    navigate(`/novel/${novel.id}`)
    onClose()
  }

  const handleOpenInNewTab = () => {
    window.open(`/novel/${novel.id}`, '_blank', 'noopener,noreferrer')
    closeContextMenu()
    onClose()
  }

  const startLongPress = (x: number, y: number) => {
    setMenuPosition({ x, y })
    longPressTriggered.current = false
    clearLongPressTimer()
    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true
      setShowContextMenu(true)
    }, 500)
  }

  const handleReadButtonClick = () => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false
      return
    }
    handleOpenInNewTab()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    startLongPress(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = () => {
    clearLongPressTimer()
  }

  const handleTouchCancel = () => {
    clearLongPressTimer()
    longPressTriggered.current = false
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    startLongPress(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    clearLongPressTimer()
  }

  const handleMouseLeave = () => {
    clearLongPressTimer()
  }

  const handleReadButtonContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex h-[78vh] md:h-[72vh] flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1 md:pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
          <NovelDetailContent
            novel={novel}
            locale={locale}
            t={t}
            formatNumber={formatNumber}
            onNavigateAuthor={(authorId) => {
              navigate(`/author/${authorId}`)
              onClose()
            }}
            onNavigateSeries={(seriesId) => {
              navigate(`/series/${seriesId}`)
              onClose()
            }}
          />
        </div>

        <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-4 pt-4 md:pt-6 mt-4 md:mt-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-6 md:px-8 py-3 md:py-4 h-12 md:h-14 bg-muted text-foreground font-bold rounded-lg hover:scale-105 hover:bg-border transition-all"
          >
            {t('preview.close')}
          </button>
          <div className="relative group/btn">
            <button
              onClick={handleReadButtonClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onContextMenu={handleReadButtonContextMenu}
              className="w-full md:w-auto px-8 md:px-10 py-3 md:py-4 h-12 md:h-14 bg-primary text-white font-bold rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 select-none touch-manipulation"
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {t('preview.readNow')}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            {showContextMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={closeContextMenu}
                />
                <div
                  className="fixed z-50 bg-white rounded-lg border-2 border-primary shadow-xl py-2 min-w-[200px]"
                  style={{
                    left: `${menuPosition.x}px`,
                    top: `${menuPosition.y}px`,
                    transform: 'translate(-50%, -100%) translateY(-12px)'
                  }}
                >
                  <button
                    onClick={handleReadNowInCurrentTab}
                    className="w-full px-6 py-3 text-left font-bold text-foreground hover:bg-primary hover:text-white transition-colors"
                  >
                    {t('preview.openCurrentTab')}
                  </button>
                  <button
                    onClick={handleOpenInNewTab}
                    className="w-full px-6 py-3 text-left font-bold text-foreground hover:bg-primary hover:text-white transition-colors"
                  >
                    {t('preview.openNewTab')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
