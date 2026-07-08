import { describe, expect, it } from 'vitest'
import {
  buildHistoryDocumentTitle,
  buildHistoryEntryDateFormatter,
  buildHistoryEntryCardViewModel,
  buildHistoryListRequestPath,
  buildHistoryPageViewModel,
  buildHistorySubtitle,
  formatHistoryEntryDate,
  getHistoryLoadErrorMessage,
  isHistoryEntryActivationKey,
} from './historyPageModel'

const translations: Record<string, string> = {
  'history.today': '今天',
  'history.yesterday': '昨天',
  'history.daysAgo': '{count}天前',
}

const t = (key: string) => translations[key] ?? key
const formatNumber = (value: number) => `#${value}`
const now = new Date('2026-07-07T12:00:00.000Z').getTime()
const day = 24 * 60 * 60 * 1000

describe('formatHistoryEntryDate', () => {
  it('formats entries from today and yesterday', () => {
    expect(formatHistoryEntryDate({ timestamp: now, now, locale: 'zh', t, formatNumber })).toBe('今天')
    expect(formatHistoryEntryDate({ timestamp: now - day, now, locale: 'zh', t, formatNumber })).toBe('昨天')
  })

  it('formats entries within the last week with localized day counts', () => {
    expect(formatHistoryEntryDate({ timestamp: now - day * 3, now, locale: 'zh', t, formatNumber })).toBe('#3天前')
    expect(formatHistoryEntryDate({ timestamp: now - day * 6, now, locale: 'zh', t, formatNumber })).toBe('#6天前')
  })

  it('formats older entries with locale-specific dates', () => {
    expect(formatHistoryEntryDate({ timestamp: now - day * 7, now, locale: 'zh', t, formatNumber })).toBe('2026/6/30')
    expect(formatHistoryEntryDate({ timestamp: now - day * 7, now, locale: 'ja', t, formatNumber })).toBe('2026/6/30')
  })

  it('builds reusable history entry date formatters', () => {
    const formatDate = buildHistoryEntryDateFormatter({
      now,
      locale: 'zh',
      t,
      formatNumber,
    })

    expect(formatDate(now - day * 2)).toBe('#2天前')
  })
})

describe('historyPageModel', () => {
  it('builds the history document title from the localized default', () => {
    expect(buildHistoryDocumentTitle('阅读历史 - Pixvel')).toBe('阅读历史 - Pixvel')
  })

  it('builds the history list request path with the configured limit', () => {
    expect(buildHistoryListRequestPath(50)).toBe('/history/novels?limit=50')
  })

  it('builds the localized history subtitle from the entry count', () => {
    expect(buildHistorySubtitle({
      template: '最近阅读的 {count} 部作品',
      count: 12,
      formatNumber,
    })).toBe('最近阅读的 #12 部作品')
  })

  it('uses Error messages before falling back to the localized load message', () => {
    expect(getHistoryLoadErrorMessage(new Error('ERR_HISTORY_FAILED'), 'fallback')).toBe('ERR_HISTORY_FAILED')
    expect(getHistoryLoadErrorMessage('bad response', 'fallback')).toBe('fallback')
  })

  it('builds history page view state and subtitle', () => {
    const formatSubtitle = (count: number) => `Read ${count}`

    expect(buildHistoryPageViewModel({
      isLoading: true,
      hasError: false,
      historyCount: 0,
      formatSubtitle,
    })).toEqual({
      state: 'loading',
      subtitle: 'Read 0',
    })

    expect(buildHistoryPageViewModel({
      isLoading: false,
      hasError: true,
      historyCount: 2,
      formatSubtitle,
    })).toEqual({
      state: 'error',
      subtitle: 'Read 2',
    })

    expect(buildHistoryPageViewModel({
      isLoading: false,
      hasError: false,
      historyCount: 0,
      formatSubtitle,
    })).toEqual({
      state: 'empty',
      subtitle: 'Read 0',
    })

    expect(buildHistoryPageViewModel({
      isLoading: false,
      hasError: false,
      historyCount: 3,
      formatSubtitle,
    })).toEqual({
      state: 'results',
      subtitle: 'Read 3',
    })
  })

  it('builds history entry card state from saved positions', () => {
    expect(buildHistoryEntryCardViewModel({ position: 0 })).toEqual({
      showContinue: false,
    })
    expect(buildHistoryEntryCardViewModel({ position: 12 })).toEqual({
      showContinue: true,
    })
  })

  it('recognizes keyboard activation keys for history entries', () => {
    expect(isHistoryEntryActivationKey('Enter')).toBe(true)
    expect(isHistoryEntryActivationKey(' ')).toBe(true)
    expect(isHistoryEntryActivationKey('Escape')).toBe(false)
  })
})
