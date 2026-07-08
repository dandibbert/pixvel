interface FilterPanelTriggerProps {
  title: string
  isOpen: boolean
  activeFilterCount: number
  onOpen: () => void
}

export default function FilterPanelTrigger({
  title,
  isOpen,
  activeFilterCount,
  onOpen,
}: FilterPanelTriggerProps) {
  return (
    <button
      onClick={onOpen}
      className="flex items-center space-x-3 h-14 px-6 bg-muted rounded-lg hover:scale-105 active:scale-95 transition-all"
      aria-expanded={isOpen}
      aria-haspopup="dialog"
    >
      <svg
        className="w-5 h-5 text-foreground/40"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>
      <span className="text-sm font-black text-foreground/60 uppercase tracking-widest">{title}</span>
      {activeFilterCount > 0 && (
        <span className="min-w-6 h-6 px-2 bg-primary text-white rounded-full text-xs font-black flex items-center justify-center">
          {activeFilterCount}
        </span>
      )}
    </button>
  )
}
