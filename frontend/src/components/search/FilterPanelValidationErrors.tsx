import { type FilterValidationError } from './filterPanelModel'

interface FilterPanelValidationErrorsProps {
  errors: ReadonlyArray<FilterValidationError>
  translateError: (error: FilterValidationError) => string
}

export default function FilterPanelValidationErrors({
  errors,
  translateError,
}: FilterPanelValidationErrorsProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <div className="mb-4 space-y-2 rounded-lg border-2 border-accent/20 bg-accent/10 p-3">
      {errors.map((error) => (
        <p key={error} className="text-xs font-black text-accent uppercase tracking-widest">
          {translateError(error)}
        </p>
      ))}
    </div>
  )
}
