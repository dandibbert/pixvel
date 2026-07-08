export function readStorageItem(storage: Storage, key: string, fallback = ''): string {
  try {
    return storage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

export function writeStorageItem(storage: Storage, key: string, value: string): boolean {
  try {
    storage.setItem(key, value)
    return true
  } catch {
    return false
  }
}
