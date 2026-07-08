import { useSearchParams } from 'react-router-dom'
import { useCallback } from 'react'
import {
  buildUpdatedURLSearchParams,
  buildURLState,
  type URLStateValue,
} from './useURLStateModel'

export function useURLState<T extends { [K in keyof T]: URLStateValue }>(
  defaultValues: T
): [T, (updates: Partial<T>) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = useCallback(() => buildURLState(searchParams, defaultValues), [searchParams, defaultValues])()

  const setState = useCallback(
    (updates: Partial<T>) => {
      setSearchParams((prevParams) => {
        return buildUpdatedURLSearchParams(prevParams, updates)
      }, { replace: true })
    },
    [setSearchParams]
  )

  return [state, setState]
}
