interface FilterPanelActionsProps {
  resetLabel: string
  applyLabel: string
  onReset: () => void
  onApply: () => void
}

export default function FilterPanelActions({
  resetLabel,
  applyLabel,
  onReset,
  onApply,
}: FilterPanelActionsProps) {
  return (
    <div className="flex items-center gap-4 pt-2">
      <button
        type="button"
        onClick={onReset}
        className="flex-1 h-12 px-6 bg-muted text-foreground/40 font-black rounded-lg hover:text-accent transition-all uppercase tracking-widest text-xs"
      >
        {resetLabel}
      </button>
      <button
        type="button"
        onClick={onApply}
        className="flex-[2] h-12 px-6 bg-primary text-white font-black rounded-lg hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
      >
        {applyLabel}
      </button>
    </div>
  )
}
