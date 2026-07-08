export function stringOrEmpty(value: string | number | null | undefined): string {
  return value?.toString() || "";
}

export function numberOrZero(value: number | null | undefined): number {
  return value || 0;
}

export function firstNonEmptyString(
  ...values: Array<string | null | undefined>
): string {
  return values.find((value) => Boolean(value)) || "";
}

export function arrayOrEmpty<T>(values: T[] | null | undefined): T[] {
  return values || [];
}

export function mapArrayOrEmpty<T, U>(
  values: T[] | null | undefined,
  mapValue: (value: T) => U,
): U[] {
  return arrayOrEmpty(values).map(mapValue);
}
