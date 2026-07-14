import { type ReactNode } from 'react'

interface FilterPanelDrawerProps {
  title: string
  children: ReactNode
  onClose: () => void
}

export default function FilterPanelDrawer({
  title,
  children,
  onClose,
}: FilterPanelDrawerProps) {
  const closeOnOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      data-testid="filter-overlay"
      className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-[2px] flex items-end overflow-y-auto overscroll-contain p-2 md:items-start md:justify-end md:p-8"
      onClick={closeOnOverlayClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full md:w-[28rem] max-h-[calc(100dvh-1rem)] md:max-h-[86vh] overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] bg-white border-t-8 md:border-4 border-primary rounded-t-2xl md:rounded-xl p-6 md:p-8 shadow-2xl"
      >
        {children}
      </div>
    </div>
  )
}
