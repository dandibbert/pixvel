import { useState, useEffect } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  onFocus?: () => void
  placeholder?: string
  debounceMs?: number
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onFocus,
  placeholder = '搜索小说...',
  debounceMs = 500,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localValue, value, onChange, debounceMs])

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
          placeholder={placeholder}
          className="w-full h-16 px-6 pl-14 pr-32 bg-muted text-foreground font-bold rounded-lg focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/20 transition-all text-lg"
        />
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/30">
          <svg
            className="w-6 h-6"
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
          className="absolute right-3 top-1/2 -translate-y-1/2 h-12 px-6 bg-primary text-white rounded-md hover:scale-105 active:scale-95 transition-all text-sm font-black uppercase tracking-widest"
        >
          搜索
        </button>
      </div>
    </form>
  )
}
