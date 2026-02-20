interface SortControlsProps {
  value: 'date_desc' | 'date_asc' | 'popular_desc'
  onChange: (value: 'date_desc' | 'date_asc' | 'popular_desc') => void
}

export default function SortControls({ value, onChange }: SortControlsProps) {
  const options = [
    { value: 'date_desc' as const, label: '最新发布' },
    { value: 'date_asc' as const, label: '最早发布' },
    { value: 'popular_desc' as const, label: '最受欢迎' },
  ]

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-black text-foreground/30 uppercase tracking-widest hidden sm:inline">排序方式</span>
      <div className="flex bg-muted p-1.5 rounded-lg">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 h-10 rounded-md text-xs font-black transition-all uppercase tracking-widest ${
              value === option.value
                ? 'bg-primary text-white scale-105'
                : 'text-foreground/40 hover:text-foreground hover:bg-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
