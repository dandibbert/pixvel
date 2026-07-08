interface FilterPanelHeaderProps {
  title: string
  closeLabel: string
  onClose: () => void
}

export default function FilterPanelHeader({
  title,
  closeLabel,
  onClose,
}: FilterPanelHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">{title}</h2>
        <p className="mt-2 text-xs font-bold text-foreground/40 uppercase tracking-widest">
          Pixiv App API
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-10 h-10 bg-muted rounded-lg text-foreground/40 hover:text-accent transition-colors font-black"
        aria-label={closeLabel}
      >
        ×
      </button>
    </div>
  )
}
