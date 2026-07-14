import { useI18n } from '../../i18n/useI18n'
import { useDebouncedControlledValue } from '../../hooks/useDebouncedControlledValue'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  onFocus?: () => void
  placeholder?: string
  debounceMs?: number
  maxLength?: number
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onFocus,
  placeholder,
  debounceMs = 500,
  maxLength,
}: SearchBarProps) {
  const { t } = useI18n()
  const [localValue, setLocalValue] = useDebouncedControlledValue({
    value,
    onChange,
    debounceMs,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative group">
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onFocus={onFocus}
          maxLength={maxLength}
          placeholder={placeholder ?? t('search.placeholder')}
          className="w-full h-14 md:h-16 px-4 md:px-6 pl-12 md:pl-14 pr-24 md:pr-32 bg-muted text-foreground font-bold rounded-xl md:rounded-lg focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/20 transition-all text-base md:text-lg"
        />
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/30">
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          type="submit"
          className="absolute right-1.5 md:right-3 top-1/2 -translate-y-1/2 h-11 md:h-12 px-4 md:px-6 bg-primary text-white rounded-lg md:rounded-md hover:bg-primary/90 active:bg-primary/80 transition-colors text-sm font-black"
        >
          {t('search.submit')}
        </button>
      </div>
    </form>
  )
}
