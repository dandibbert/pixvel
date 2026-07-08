interface FilterSwitchOption {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}

interface FilterSwitchGroupProps {
  title: string
  switches: ReadonlyArray<FilterSwitchOption>
}

export default function FilterSwitchGroup({
  title,
  switches,
}: FilterSwitchGroupProps) {
  return (
    <section className="mb-6 p-4 bg-muted/70 rounded-xl border-2 border-muted">
      <h3 className="text-xs font-black text-foreground/40 mb-3 uppercase tracking-widest">
        {title}
      </h3>
      <div className="space-y-3">
        {switches.map((option) => (
          <SwitchRow
            key={option.label}
            label={option.label}
            checked={option.checked}
            onChange={option.onChange}
          />
        ))}
      </div>
    </section>
  )
}

function SwitchRow({
  label,
  checked,
  onChange,
}: FilterSwitchOption) {
  return (
    <label className="flex items-center justify-between gap-4 p-3 bg-white rounded-lg cursor-pointer">
      <span className="text-sm font-black text-foreground/70">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="w-5 h-5 accent-primary"
      />
    </label>
  )
}
