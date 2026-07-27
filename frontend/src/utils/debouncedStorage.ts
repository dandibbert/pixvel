import type { StateStorage } from 'zustand/middleware'

export const DEFAULT_PERSIST_DEBOUNCE_MS = 1000

interface DebouncedStateStorageOptions {
  delayMs?: number
  /**
   * Receives the flush function so callers can bind it to lifecycle events
   * (pagehide/visibilitychange) and not lose the trailing write on tab close.
   */
  registerFlush?: (flush: () => void) => void
}

/**
 * Wraps a StateStorage so rapid writes collapse into one trailing write.
 *
 * zustand's persist middleware serializes the whole partialized state on
 * EVERY set(); for stores that persist large snapshots (readerStore caches
 * up to 20 full novel texts) this makes each page turn synchronously
 * JSON-write megabytes to localStorage. Debouncing keeps memory state
 * authoritative and bounds storage writes to one per delay window.
 */
export function createDebouncedStateStorage(
  storage: StateStorage,
  { delayMs = DEFAULT_PERSIST_DEBOUNCE_MS, registerFlush }: DebouncedStateStorageOptions = {},
): StateStorage {
  let pending: { name: string; value: string } | null = null
  let timer: ReturnType<typeof setTimeout> | null = null

  const flush = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    if (pending) {
      const { name, value } = pending
      pending = null
      try {
        storage.setItem(name, value)
      } catch {
        // localStorage can throw SecurityError or QuotaExceededError. The
        // in-memory Zustand state remains authoritative for this session.
      }
    }
  }

  registerFlush?.(flush)

  return {
    getItem: (name) => {
      if (pending && pending.name === name) {
        return pending.value
      }
      try {
        return storage.getItem(name)
      } catch {
        return null
      }
    },
    setItem: (name, value) => {
      pending = { name, value }
      if (timer === null) {
        timer = setTimeout(flush, delayMs)
      }
    },
    removeItem: (name) => {
      if (pending?.name === name) {
        pending = null
        if (timer !== null) {
          clearTimeout(timer)
          timer = null
        }
      }
      try {
        storage.removeItem(name)
      } catch {
        // Storage unavailable; in-memory state is already cleared.
      }
    },
  }
}

/**
 * Flush pending persist writes when the page is being hidden or unloaded,
 * so the last write inside the debounce window is not lost.
 */
export function registerPageHideFlush(flush: () => void) {
  if (typeof window === 'undefined') return

  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flush()
    }
  })
}
