export type URLStateValue = string | number | boolean
export type URLStateUpdateValue = URLStateValue | null | undefined

export function parseURLStateValue<T extends URLStateValue>(value: string, defaultValue: T): T {
  if (typeof defaultValue === 'number') {
    const trimmedValue = value.trim()
    if (trimmedValue.length === 0) return defaultValue

    const parsedValue = Number(trimmedValue)
    return Number.isFinite(parsedValue) ? parsedValue as T : defaultValue
  }

  if (typeof defaultValue === 'boolean') {
    if (value === 'true') return true as T
    if (value === 'false') return false as T
    return defaultValue
  }

  return value as T
}

export function buildURLState<T extends { [K in keyof T]: URLStateValue }>(
  searchParams: URLSearchParams,
  defaultValues: T,
): T {
  const result = { ...defaultValues }

  for (const key in defaultValues) {
    const value = searchParams.get(key)
    if (value !== null) {
      const defaultValue = defaultValues[key]
      result[key] = parseURLStateValue(value, defaultValue) as T[Extract<keyof T, string>]
    }
  }

  return result
}

export function buildUpdatedURLSearchParams<T extends { [K in keyof T]: URLStateUpdateValue }>(
  searchParams: URLSearchParams,
  updates: T,
): URLSearchParams {
  const nextParams = new URLSearchParams(searchParams)

  for (const key in updates) {
    const value = updates[key]
    if (value === undefined || value === null || value === '') {
      nextParams.delete(key)
    } else {
      nextParams.set(key, String(value))
    }
  }

  return nextParams
}
