type ClassNameValue = string | false | null | undefined

export function joinClassNames(...values: ClassNameValue[]) {
  return values
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean)
    .join(' ')
}
