import { describe, expect, it } from 'vitest'
import {
  BOOKMARK_PRESETS,
  buildDatePresetRange,
  DATE_PRESETS,
  formatDateInputValue,
  isValidIsoDate,
  normalizeDateInput,
  parseNumberInput,
} from './filterRangeModel'

describe('filterRangeModel', () => {
  it('defines the mobile date and bookmark preset order', () => {
    expect(DATE_PRESETS).toEqual([
      'anytime',
      'last7Days',
      'last30Days',
      'last180Days',
      'last365Days',
    ])
    expect(BOOKMARK_PRESETS).toEqual([0, 100, 500, 1000, 5000, 10000])
  })

  it('normalizes direct date keyboard input and formats the controlled value', () => {
    expect(normalizeDateInput('20260612')).toBe('2026-06-12')
    expect(normalizeDateInput('2026/06/1')).toBe('2026-06-1')
    expect(normalizeDateInput('2026年06月12日99')).toBe('2026-06-12')
    expect(normalizeDateInput('')).toBe('')

    expect(formatDateInputValue('2026-06-12')).toBe('2026/06/12')
    expect(formatDateInputValue('2026-06-1')).toBe('2026/06/1')
  })

  it('builds inclusive relative date ranges in local calendar time', () => {
    const today = new Date(2026, 6, 11)

    expect(buildDatePresetRange('anytime', today)).toEqual({
      startDate: '',
      endDate: '',
    })
    expect(buildDatePresetRange('last7Days', today)).toEqual({
      startDate: '2026-07-05',
      endDate: '2026-07-11',
    })
    expect(buildDatePresetRange('last30Days', today)).toEqual({
      startDate: '2026-06-12',
      endDate: '2026-07-11',
    })
  })

  it('recognizes real ISO dates including leap years', () => {
    expect(isValidIsoDate('2024-02-29')).toBe(true)
    expect(isValidIsoDate('2026-02-29')).toBe(false)
    expect(isValidIsoDate('2026-02-30')).toBe(false)
    expect(isValidIsoDate('2026-07-11')).toBe(true)
    expect(isValidIsoDate('2026-07-1')).toBe(false)
    expect(isValidIsoDate('')).toBe(false)
  })

  it('parses direct bookmark keyboard input as non-negative integers', () => {
    expect(parseNumberInput('')).toBe(0)
    expect(parseNumberInput('abc')).toBe(0)
    expect(parseNumberInput('1,000')).toBe(1000)
    expect(parseNumberInput('2500')).toBe(2500)
    expect(parseNumberInput('-5')).toBe(5)
  })
})
