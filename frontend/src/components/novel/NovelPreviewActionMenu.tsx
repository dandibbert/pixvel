interface NovelPreviewActionMenuProps {
  x: number
  y: number
  openCurrentTabLabel: string
  openNewTabLabel: string
  onClose: () => void
  onOpenCurrentTab: () => void
  onOpenNewTab: () => void
}

export default function NovelPreviewActionMenu({
  x,
  y,
  openCurrentTabLabel,
  openNewTabLabel,
  onClose,
  onOpenCurrentTab,
  onOpenNewTab,
}: NovelPreviewActionMenuProps) {
  return (
    <>
      <div
        data-testid="preview-action-menu-backdrop"
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        data-testid="preview-action-menu"
        className="fixed z-50 bg-white rounded-lg border-2 border-primary shadow-xl py-2 min-w-[200px]"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-50%, -100%) translateY(-12px)',
        }}
      >
        <button
          onClick={onOpenCurrentTab}
          className="w-full px-6 py-3 text-left font-bold text-foreground hover:bg-primary hover:text-white transition-colors"
        >
          {openCurrentTabLabel}
        </button>
        <button
          onClick={onOpenNewTab}
          className="w-full px-6 py-3 text-left font-bold text-foreground hover:bg-primary hover:text-white transition-colors"
        >
          {openNewTabLabel}
        </button>
      </div>
    </>
  )
}
