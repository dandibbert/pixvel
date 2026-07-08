import { Dispatch, SetStateAction, useEffect, useState } from 'react'

interface UseDebouncedControlledValueOptions {
  value: string
  onChange: (value: string) => void
  debounceMs: number
}

export function useDebouncedControlledValue({
  value,
  onChange,
  debounceMs,
}: UseDebouncedControlledValueOptions): [string, Dispatch<SetStateAction<string>>] {
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

  return [localValue, setLocalValue]
}
