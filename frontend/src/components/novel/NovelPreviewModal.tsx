import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import Modal from '../common/Modal'
import { Novel } from '../../types/novel'

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
        <div className="min-h-0 flex-1 overflow-y-auto pr-1 md:pr-2">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight tracking-tight">
                {novel.title}
              </h2>
              <div className="flex items-center space-x-4 mb-6">
                <button
                  type="button"
                  className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center font-black text-primary text-xl hover:scale-105 transition-transform"
                  onClick={() => {
                    navigate(`/author/${novel.author.id}`)
                    onClose()
                  }}
                >
                  {novel.author.name[0]}
                </button>
                <div>
                  <button
                    type="button"
                    className="font-bold text-foreground text-lg hover:text-primary transition-colors"
                    onClick={() => {
                      navigate(`/author/${novel.author.id}`)
                      onClose()
                    }}
                  >
                    {novel.author.name}
                  </button>
                  <p className="text-sm font-bold text-foreground/40">
                    {new Date(novel.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>

              {novel.series?.id && novel.series.title && (
                <button
                  type="button"
                  className="mb-6 w-full md:w-auto inline-flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-lg font-black hover:bg-primary hover:text-white transition-all"
                  onClick={() => {
                    navigate(`/series/${novel.series?.id}`)
                    onClose()
                  }}
                >
                  <span className="uppercase tracking-widest text-[10px]">系列</span>
                  <span className="truncate">{novel.series.title}</span>
                </button>
              )}

              <div className="flex items-center space-x-8 text-sm font-bold text-foreground/50 mb-6">
                <span className="flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                   </svg>
                  {novel.totalBookmarks.toLocaleString()}
                </span>
                <span className="flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                   </svg>
                  {novel.totalViews.toLocaleString()}
                </span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase tracking-widest text-[10px]">{novel.pageCount}P</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {novel.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 bg-muted text-foreground/60 text-xs rounded-md font-extrabold hover:bg-primary hover:text-white transition-all cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-foreground mb-3 uppercase tracking-wider">简介</h3>
              <div
                className="text-foreground/70 leading-relaxed font-medium text-lg bg-muted/30 p-6 rounded-lg"
                dangerouslySetInnerHTML={{ __html: novel.description }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-end gap-4 pt-6 mt-6 border-t-2 border-muted">
          <button
            onClick={onClose}
            className="px-8 py-4 h-16 bg-muted text-foreground font-bold rounded-lg hover:scale-105 hover:bg-border transition-all"
          >
            关闭
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
              className="w-full md:w-auto px-10 py-4 h-16 bg-primary text-white font-black rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 select-none touch-manipulation"
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              立即阅读
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
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
                  className="fixed z-50 bg-white rounded-lg border-4 border-primary py-2 min-w-[200px]"
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
                    当前标签页打开
                  </button>
                  <button
                    onClick={handleOpenInNewTab}
                    className="w-full px-6 py-3 text-left font-bold text-foreground hover:bg-primary hover:text-white transition-colors"
                  >
                    新标签页打开
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
