import { isHistoryEntryActivationKey } from './historyPageModel'

interface HistoryEntryCardProps {
  title: string
  formattedDate: string
  showContinue: boolean
  continueLabel: string
  onClick: () => void
}

export default function HistoryEntryCard({
  title,
  formattedDate,
  showContinue,
  continueLabel,
  onClick,
}: HistoryEntryCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (isHistoryEntryActivationKey(event.key)) {
          event.preventDefault()
          onClick()
        }
      }}
      className="bg-white border border-border/50 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer group flex flex-col h-full hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
    >
      <div className="p-3 md:p-4 flex flex-col gap-3 flex-1">
        <h3 className="text-sm md:text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug tracking-tight">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-muted">
          <span className="text-[10px] md:text-xs font-semibold text-foreground/40 uppercase tracking-wider">{formattedDate}</span>
          {showContinue && (
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-wider">{continueLabel}</span>
          )}
        </div>
      </div>
    </div>
  )
}
