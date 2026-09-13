import { describe, expect, it } from 'vitest'
import {
  MAX_TRACKED_READING_PROGRESS,
  parseReadingProgressRecord,
  pruneReadingProgressRecord,
  READING_PROGRESS_STORAGE_KEY,
  readReadingProgressOffset,
  readReadingProgressPage,
  resolveReadingProgressOffset,
  resolveReadingProgressPage,
  updateReadingProgressRecord,
  writeReadingProgress,
} from './readingProgress'

function createMemoryStorage(initial: Record<string, string> = {}): Storage {
  const entries = new Map(Object.entries(initial))

  return {
    get length() {
      return entries.size
    },
    clear: () => entries.clear(),
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => Array.from(entries.keys())[index] ?? null,
    removeItem: (key: string) => {
      entries.delete(key)
    },
    setItem: (key: string, value: string) => {
      entries.set(key, value)
    },
  }
}

function createFailingStorage(): Storage {
  return {
    ...createMemoryStorage(),
    getItem: () => {
      throw new Error('storage blocked')
    },
    setItem: () => {
      throw new Error('storage blocked')
    },
  }
}

describe('readingProgress', () => {
  it('parses stored entries and drops malformed ones', () => {
    const record = parseReadingProgressRecord(JSON.stringify({
      'novel-1': { page: 2, offset: 640, updatedAt: 10 },
      'novel-2': { page: 0, offset: 10, updatedAt: 10 },
      'novel-3': { page: 1, offset: -5, updatedAt: 10 },
      'novel-4': { page: 1, offset: 10 },
      'novel-5': 'not an entry',
      'novel-6': { page: Number.NaN, offset: 10, updatedAt: 10 },
    }))

    expect(record).toEqual({ 'novel-1': { page: 2, offset: 640, updatedAt: 10 } })
  })

  it('treats unusable payloads as empty progress', () => {
    expect(parseReadingProgressRecord(null)).toEqual({})
    expect(parseReadingProgressRecord('')).toEqual({})
    expect(parseReadingProgressRecord('not json')).toEqual({})
    expect(parseReadingProgressRecord('[]')).toEqual({})
    expect(parseReadingProgressRecord('null')).toEqual({})
  })

  it('rounds fractional offsets so stored positions stay integers', () => {
    const record = updateReadingProgressRecord({}, {
      novelId: 'novel-1',
      page: 1,
      offset: 640.4,
      updatedAt: 20,
    })

    expect(record['novel-1']).toEqual({ page: 1, offset: 640, updatedAt: 20 })
  })

  it('replaces the entry of a novel instead of accumulating positions', () => {
    const first = updateReadingProgressRecord({}, {
      novelId: 'novel-1',
      page: 1,
      offset: 100,
      updatedAt: 10,
    })
    const second = updateReadingProgressRecord(first, {
      novelId: 'novel-1',
      page: 2,
      offset: 30,
      updatedAt: 20,
    })

    expect(second).toEqual({ 'novel-1': { page: 2, offset: 30, updatedAt: 20 } })
  })

  it('keeps only the most recently updated novels', () => {
    const record = Object.fromEntries(
      Array.from({ length: MAX_TRACKED_READING_PROGRESS + 5 }, (_unused, index) => [
        `novel-${index}`,
        { page: 1, offset: 10, updatedAt: index },
      ]),
    )

    const pruned = pruneReadingProgressRecord(record)
    const remaining = Object.keys(pruned)

    expect(remaining).toHaveLength(MAX_TRACKED_READING_PROGRESS)
    expect(remaining).toContain(`novel-${MAX_TRACKED_READING_PROGRESS + 4}`)
    expect(remaining).not.toContain('novel-0')
  })

  it('resolves a saved offset only for the page it was captured on', () => {
    const record = { 'novel-1': { page: 2, offset: 640, updatedAt: 10 } }

    expect(resolveReadingProgressOffset(record, { novelId: 'novel-1', page: 2 })).toBe(640)
    expect(resolveReadingProgressOffset(record, { novelId: 'novel-1', page: 3 })).toBeNull()
    expect(resolveReadingProgressOffset(record, { novelId: 'novel-2', page: 2 })).toBeNull()
  })

  it('ignores offsets at the top of a page', () => {
    const record = { 'novel-1': { page: 1, offset: 0, updatedAt: 10 } }

    expect(resolveReadingProgressOffset(record, { novelId: 'novel-1', page: 1 })).toBeNull()
  })

  it('resolves the saved page so an evicted novel does not reopen at page one', () => {
    const record = { 'novel-1': { page: 4, offset: 640, updatedAt: 10 } }

    expect(resolveReadingProgressPage(record, { novelId: 'novel-1', totalPages: 6 })).toBe(4)
    expect(resolveReadingProgressPage(record, { novelId: 'novel-1', totalPages: 4 })).toBe(4)
  })

  it('ignores a saved page that the novel no longer has', () => {
    const record = { 'novel-1': { page: 4, offset: 640, updatedAt: 10 } }

    expect(resolveReadingProgressPage(record, { novelId: 'novel-1', totalPages: 2 })).toBeNull()
    expect(resolveReadingProgressPage(record, { novelId: 'novel-2', totalPages: 6 })).toBeNull()
  })

  it('reads the saved page through storage', () => {
    const storage = createMemoryStorage()

    writeReadingProgress(storage, { novelId: 'novel-1', page: 3, offset: 820, updatedAt: 99 })

    expect(readReadingProgressPage(storage, { novelId: 'novel-1', totalPages: 5 })).toBe(3)
    expect(readReadingProgressPage(null, { novelId: 'novel-1', totalPages: 5 })).toBeNull()
  })

  it('round-trips progress through storage', () => {
    const storage = createMemoryStorage()

    writeReadingProgress(storage, { novelId: 'novel-1', page: 3, offset: 820, updatedAt: 99 })

    expect(readReadingProgressOffset(storage, { novelId: 'novel-1', page: 3 })).toBe(820)
    expect(storage.getItem(READING_PROGRESS_STORAGE_KEY)).toBe(
      JSON.stringify({ 'novel-1': { page: 3, offset: 820, updatedAt: 99 } }),
    )
  })

  it('preserves the progress of other novels when writing', () => {
    const storage = createMemoryStorage({
      [READING_PROGRESS_STORAGE_KEY]: JSON.stringify({
        'novel-1': { page: 1, offset: 120, updatedAt: 5 },
      }),
    })

    writeReadingProgress(storage, { novelId: 'novel-2', page: 1, offset: 60, updatedAt: 10 })

    expect(readReadingProgressOffset(storage, { novelId: 'novel-1', page: 1 })).toBe(120)
    expect(readReadingProgressOffset(storage, { novelId: 'novel-2', page: 1 })).toBe(60)
  })

  it('survives unavailable storage', () => {
    const storage = createFailingStorage()

    expect(writeReadingProgress(storage, {
      novelId: 'novel-1',
      page: 1,
      offset: 10,
      updatedAt: 10,
    })).toBe(false)
    expect(readReadingProgressOffset(storage, { novelId: 'novel-1', page: 1 })).toBeNull()
    expect(readReadingProgressOffset(null, { novelId: 'novel-1', page: 1 })).toBeNull()
  })
})
