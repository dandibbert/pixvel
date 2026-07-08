export type UrlSearchParamValue = string | number | boolean;

export function buildUrlSearchParams(
  values: Record<string, UrlSearchParamValue>,
): URLSearchParams {
  return new URLSearchParams(
    Object.entries(values).map(([key, value]) => [key, value.toString()]),
  );
}
