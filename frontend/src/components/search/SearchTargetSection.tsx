import {
  buildSearchTargetOptions,
  type SearchTarget,
} from './filterPanelModel'

interface SearchTargetSectionProps {
  title: string
  searchTarget: SearchTarget
  searchTargetLabel: (target: SearchTarget) => string
  onSearchTargetChange: (target: SearchTarget) => void
}

export default function SearchTargetSection({
  title,
  searchTarget,
  searchTargetLabel,
  onSearchTargetChange,
}: SearchTargetSectionProps) {
  const options = buildSearchTargetOptions({
    selectedTarget: searchTarget,
    searchTargetLabel,
  })

  return (
    <section className="mb-6 p-4 bg-muted/70 rounded-xl border-2 border-muted">
      <h3 className="text-xs font-black text-foreground/40 mb-3 uppercase tracking-widest">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.target}
            type="button"
            onClick={() => onSearchTargetChange(option.target)}
            className={`h-11 rounded-lg text-xs font-black transition-all ${
              option.isSelected
                ? 'bg-primary text-white shadow-md scale-[1.02]'
                : 'bg-white text-foreground/50 hover:text-foreground'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  )
}
