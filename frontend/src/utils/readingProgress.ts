import { readStorageItem, writeStorageItem } from './safeStorage'

export const READING_PROGRESS_STORAGE_KEY = 'reader-progress-storage'

/**
 * Reading positions are tiny, but the record is rewritten while scrolling, so
 * it is capped to keep the serialized payload small.
 */
export const MAX_TRACKED_READING_PROGRESS = 50

export interface ReadingProgressEntry {
  page: number
  offset: number
  updatedAt: number
}

export type ReadingProgressRecord = Record<string, ReadingProgressEntry>

interface ReadingProgressLocation {
  novelId: string
  page: number
}

interface ReadingProgressUpdate extends ReadingProgressLocation {
  offset: number
  updatedAt: number
}

export function parseReadingProgressRecord(raw: string | null): ReadingProgressRecord {
  if (!raw) return {}

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {}
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {}
  }

  const record: ReadingProgressRecord = {}
  for (const [novelId, value] of Object.entries(parsed as Record<string, unknown>)) {
    const entry = parseReadingProgressEntry(value)
    if (novelId && entry) {
      record[novelId] = entry
    }
  }

  return record
}

export function updateReadingProgressRecord(
  record: ReadingProgressRecord,
  { novelId, page, offset, updatedAt }: ReadingProgressUpdate,
): ReadingProgressRecord {
  const next: ReadingProgressRecord = {
    ...record,
    [novelId]: {
      page: normalizePage(page),
      offset: normalizeOffset(offset),
      updatedAt,
    },
  }

  return pruneReadingProgressRecord(next)
}

export function pruneReadingProgressRecord(
  record: ReadingProgressRecord,
  limit = MAX_TRACKED_READING_PROGRESS,
): ReadingProgressRecord {
  const entries = Object.entries(record)
  if (entries.length <= limit) return record

  return Object.fromEntries(
    entries
      .sort(([, left], [, right]) => right.updatedAt - left.updatedAt)
      .slice(0, limit),
  )
}

/**
 * A stored offset only means anything on the page it was taken from, so a
 * mismatching page resumes at the top instead of an arbitrary position.
 */
export function resolveReadingProgressOffset(
  record: ReadingProgressRecord,
  { novelId, page }: ReadingProgressLocation,
): number | null {
  const entry = record[novelId]
  if (!entry || entry.page !== page || entry.offset <= 0) return null

  return entry.offset
}

export function readReadingProgressOffset(
  storage: Storage | null | undefined,
  location: ReadingProgressLocation,
): number | null {
  if (!storage) return null

  const record = parseReadingProgressRecord(
    readStorageItem(storage, READING_PROGRESS_STORAGE_KEY, ''),
  )

  return resolveReadingProgressOffset(record, location)
}

export function writeReadingProgress(
  storage: Storage | null | undefined,
  update: ReadingProgressUpdate,
): boolean {
  if (!storage) return false

  const record = parseReadingProgressRecord(
    readStorageItem(storage, READING_PROGRESS_STORAGE_KEY, ''),
  )

  return writeStorageItem(
    storage,
    READING_PROGRESS_STORAGE_KEY,
    JSON.stringify(updateReadingProgressRecord(record, update)),
  )
}

function parseReadingProgressEntry(value: unknown): ReadingProgressEntry | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null

  const entry = value as Record<string, unknown>
  if (
    !isFiniteNumber(entry.page) ||
    !isFiniteNumber(entry.offset) ||
    !isFiniteNumber(entry.updatedAt)
  ) {
    return null
  }

  if (entry.page < 1 || entry.offset < 0) return null

  return {
    page: normalizePage(entry.page),
    offset: normalizeOffset(entry.offset),
    updatedAt: entry.updatedAt,
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function normalizePage(page: number): number {
  return Math.max(1, Math.round(page))
}

function normalizeOffset(offset: number): number {
  return Math.max(0, Math.round(offset))
}
