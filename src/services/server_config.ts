const DEFAULT_PORT = 8000;
const MIN_PORT = 1;
const MAX_PORT = 65535;

export function parseServerPort(value: string | null | undefined, fallback = DEFAULT_PORT): number {
  const trimmed = value?.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return fallback;
  }

  const port = Number(trimmed);
  if (!Number.isSafeInteger(port) || port < MIN_PORT || port > MAX_PORT) {
    return fallback;
  }

  return port;
}
