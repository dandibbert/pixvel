import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { StateStorage } from 'zustand/middleware'
import {
  createDebouncedStateStorage,
  DEFAULT_PERSIST_DEBOUNCE_MS,
} from './debouncedStorage'

function createMemoryStorage() {
  const data = new Map<string, string>()
  const setCalls: Array<{ name: string; value: string }> = []

  const storage: StateStorage = {
    getItem: (name) => data.get(name) ?? null,
    setItem: (name, value) => {
      setCalls.push({ name, value })
      data.set(name, value)
    },
    removeItem: (name) => {
      data.delete(name)
    },
  }

  return { storage, data, setCalls }
}

describe('createDebouncedStateStorage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('collapses rapid writes into a single trailing write', () => {
    const { storage, setCalls } = createMemoryStorage()
    const debounced = createDebouncedStateStorage(storage)

    debounced.setItem('key', 'v1')
    debounced.setItem('key', 'v2')
    debounced.setItem('key', 'v3')

    expect(setCalls).toHaveLength(0)

    vi.advanceTimersByTime(DEFAULT_PERSIST_DEBOUNCE_MS)

    expect(setCalls).toEqual([{ name: 'key', value: 'v3' }])
  })

  it('serves pending writes from getItem before they are flushed', () => {
    const { storage } = createMemoryStorage()
    const debounced = createDebouncedStateStorage(storage)

    debounced.setItem('key', 'pending-value')

    expect(debounced.getItem('key')).toBe('pending-value')
  })

  it('reads through to the underlying storage when nothing is pending', () => {
    const { storage, data } = createMemoryStorage()
    data.set('key', 'stored-value')
    const debounced = createDebouncedStateStorage(storage)

    expect(debounced.getItem('key')).toBe('stored-value')
  })

  it('flushes the pending write via the registered flush hook', () => {
    const { storage, setCalls } = createMemoryStorage()
    let flush: (() => void) | null = null
    const debounced = createDebouncedStateStorage(storage, {
      registerFlush: (f) => {
        flush = f
      },
    })

    debounced.setItem('key', 'value')
    expect(setCalls).toHaveLength(0)

    flush!()

    expect(setCalls).toEqual([{ name: 'key', value: 'value' }])
    // Timer was cancelled; no duplicate write later
    vi.advanceTimersByTime(DEFAULT_PERSIST_DEBOUNCE_MS * 2)
    expect(setCalls).toHaveLength(1)
  })

  it('drops the pending write when the key is removed', () => {
    const { storage, data, setCalls } = createMemoryStorage()
    data.set('key', 'old')
    const debounced = createDebouncedStateStorage(storage)

    debounced.setItem('key', 'new')
    debounced.removeItem('key')

    vi.advanceTimersByTime(DEFAULT_PERSIST_DEBOUNCE_MS)

    expect(setCalls).toHaveLength(0)
    expect(data.has('key')).toBe(false)
  })

  it('degrades gracefully when browser storage is unavailable or full', () => {
    const unavailableStorage: StateStorage = {
      getItem: () => {
        throw new DOMException('blocked', 'SecurityError')
      },
      setItem: () => {
        throw new DOMException('full', 'QuotaExceededError')
      },
      removeItem: () => {
        throw new DOMException('blocked', 'SecurityError')
      },
    }
    const debounced = createDebouncedStateStorage(unavailableStorage)

    expect(debounced.getItem('key')).toBeNull()
    debounced.setItem('key', 'value')
    expect(() => vi.advanceTimersByTime(DEFAULT_PERSIST_DEBOUNCE_MS)).not.toThrow()
    expect(() => debounced.removeItem('key')).not.toThrow()
  })
})
