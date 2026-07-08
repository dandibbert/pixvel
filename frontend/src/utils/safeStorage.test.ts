import { describe, expect, it, vi } from 'vitest'
import { readStorageItem, writeStorageItem } from './safeStorage'

function createStorage(overrides: Partial<Pick<Storage, 'getItem' | 'setItem'>>): Storage {
  return {
    get length() {
      return 0
    },
    clear: vi.fn(),
    getItem: vi.fn(() => null),
    key: vi.fn(() => null),
    removeItem: vi.fn(),
    setItem: vi.fn(),
    ...overrides,
  }
}

describe('safeStorage', () => {
  it('reads string values and falls back when the key is missing', () => {
    const storage = createStorage({
      getItem: vi.fn((key: string) => (key === 'saved' ? 'value' : null)),
    })

    expect(readStorageItem(storage, 'saved')).toBe('value')
    expect(readStorageItem(storage, 'missing')).toBe('')
    expect(readStorageItem(storage, 'missing', 'fallback')).toBe('fallback')
  })

  it('returns the fallback when storage read or write throws', () => {
    const storage = createStorage({
      getItem: vi.fn(() => {
        throw new Error('storage unavailable')
      }),
      setItem: vi.fn(() => {
        throw new Error('storage unavailable')
      }),
    })

    expect(readStorageItem(storage, 'saved', 'fallback')).toBe('fallback')
    expect(writeStorageItem(storage, 'saved', 'value')).toBe(false)
  })

  it('reports successful writes', () => {
    const setItem = vi.fn()
    const storage = createStorage({ setItem })

    expect(writeStorageItem(storage, 'saved', 'value')).toBe(true)
    expect(setItem).toHaveBeenCalledWith('saved', 'value')
  })
})
