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
    <div className="sticky bottom-0 z-10 -mx-6 -mb-6 mt-4 flex items-center gap-3 border-t border-border bg-white px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:-mx-8 md:-mb-8 md:px-8">
      <button
        type="button"
        onClick={onReset}
        className="flex-1 min-h-[48px] px-4 bg-muted text-foreground/55 font-black rounded-lg hover:text-accent transition-colors text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {resetLabel}
      </button>
      <button
        type="button"
        onClick={onApply}
        className="flex-[2] min-h-[48px] px-4 bg-primary text-white font-black rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {applyLabel}
      </button>
    </div>
  )
}
