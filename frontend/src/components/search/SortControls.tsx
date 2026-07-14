import { useI18n } from '../../i18n/useI18n'

type SearchSort = 'date_desc' | 'date_asc' | 'popular_desc'

interface SortControlsProps {
  value: SearchSort
  onChange: (value: SearchSort) => void
}

const SORT_OPTIONS: SearchSort[] = [
  'date_desc',
  'date_asc',
  'popular_desc',
]

export default function SortControls({ value, onChange }: SortControlsProps) {
  const { t, sortLabel } = useI18n()

  return (
    <>
      <label className="relative md:hidden">
        <span className="sr-only">{t('sort.title')}</span>
        <select
          data-mobile-sort
          aria-label={t('sort.title')}
          value={value}
          onChange={(event) => onChange(event.target.value as SearchSort)}
          className="md:hidden min-h-[44px] appearance-none rounded-lg border border-transparent bg-primary/10 pl-3 pr-9 text-xs font-black text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {sortLabel(option)}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="m7 10 5 5 5-5" />
        </svg>
      </label>

      <div data-desktop-sort className="hidden md:flex items-center gap-3">
        <span className="text-xs font-black text-foreground/30 uppercase tracking-widest">
          {t('sort.title')}
        </span>
        <div className="flex bg-muted p-1.5 rounded-lg">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`px-4 py-2 h-10 rounded-md text-xs font-black transition-all uppercase tracking-widest ${
                value === option
                  ? 'bg-primary text-white scale-105'
                  : 'text-foreground/40 hover:text-foreground hover:bg-white'
              }`}
            >
              {sortLabel(option)}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
