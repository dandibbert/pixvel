import { useLongPressMenu } from '../../hooks/useLongPressMenu'
import NovelPreviewActionMenu from './NovelPreviewActionMenu'

interface NovelPreviewActionsProps {
  closeLabel: string
  readNowLabel: string
  openCurrentTabLabel: string
  openNewTabLabel: string
  onClose: () => void
  onOpenCurrentTab: () => void
  onOpenNewTab: () => void
}

export default function NovelPreviewActions({
  closeLabel,
  readNowLabel,
  openCurrentTabLabel,
  openNewTabLabel,
  onClose,
  onOpenCurrentTab,
  onOpenNewTab,
}: NovelPreviewActionsProps) {
  const {
    isMenuOpen,
    menuPosition,
    startLongPress,
    clearLongPressTimer,
    cancelLongPress,
    closeMenu,
    consumeLongPressTrigger,
  } = useLongPressMenu({ delayMs: 500 })

  const handleReadButtonClick = () => {
    if (consumeLongPressTrigger()) {
      return
    }
    onOpenNewTab()
  }

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0]
    if (!touch) return
    startLongPress(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = () => {
    clearLongPressTimer()
  }

  const handleTouchCancel = () => {
    cancelLongPress()
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button !== 0) return
    startLongPress(event.clientX, event.clientY)
  }

  const handleMouseUp = () => {
    clearLongPressTimer()
  }

  const handleMouseLeave = () => {
    clearLongPressTimer()
  }

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
  }

  const handleOpenCurrentTab = () => {
    closeMenu()
    onOpenCurrentTab()
  }

  const handleOpenNewTab = () => {
    closeMenu()
    onOpenNewTab()
  }

  return (
    <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-4 pt-4 md:pt-6 mt-4 md:mt-6 border-t border-border">
      <button
        onClick={onClose}
        className="px-6 md:px-8 py-3 md:py-4 h-12 md:h-14 bg-muted text-foreground font-bold rounded-lg hover:scale-105 hover:bg-border transition-all"
      >
        {closeLabel}
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
          onContextMenu={handleContextMenu}
          className="w-full md:w-auto px-8 md:px-10 py-3 md:py-4 h-12 md:h-14 bg-primary text-white font-bold rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 select-none touch-manipulation"
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {readNowLabel}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        {isMenuOpen && (
          <NovelPreviewActionMenu
            x={menuPosition.x}
            y={menuPosition.y}
            openCurrentTabLabel={openCurrentTabLabel}
            openNewTabLabel={openNewTabLabel}
            onClose={closeMenu}
            onOpenCurrentTab={handleOpenCurrentTab}
            onOpenNewTab={handleOpenNewTab}
          />
        )}
      </div>
    </div>
  )
}
