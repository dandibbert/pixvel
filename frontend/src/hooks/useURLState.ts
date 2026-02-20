import { useSearchParams } from 'react-router-dom'
import { useCallback } from 'react'

export function useURLState<T extends Record<string, any>>(
  defaultValues: T
): [T, (updates: Partial<T>) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = useCallback(() => {
    const result = { ...defaultValues }
    for (const key in defaultValues) {
      const value = searchParams.get(key)
      if (value !== null) {
        const defaultValue = defaultValues[key]
        if (typeof defaultValue === 'number') {
          result[key] = Number(value) as T[Extract<keyof T, string>]
        } else if (typeof defaultValue === 'boolean') {
          result[key] = (value === 'true') as T[Extract<keyof T, string>]
        } else {
          result[key] = value as T[Extract<keyof T, string>]
        }
      }
    }
    return result
  }, [searchParams, defaultValues])()

  const setState = useCallback(
    (updates: Partial<T>) => {
      setSearchParams((prevParams) => {
        const newParams = new URLSearchParams(prevParams)
        for (const key in updates) {
          const value = updates[key]
          if (value === undefined || value === null || value === '') {
            newParams.delete(key)
          } else {
            newParams.set(key, String(value))
          }
        }
        return newParams
      }, { replace: true })
    },
    [setSearchParams]
  )

  return [state, setState]
}
