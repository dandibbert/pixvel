export function compactTrimmedStrings(values: ReadonlyArray<string | null | undefined>): string[] {
  return values
    .map((value) => value?.trim() ?? '')
    .filter((value) => value.length > 0)
}
