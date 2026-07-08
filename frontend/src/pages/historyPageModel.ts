import type { Locale } from '../stores/localeStore'
import { getErrorMessage } from '../utils/errorLog'
import { getIntlLocale } from '../utils/localeFormat'
import { formatCountTemplate } from '../utils/textTemplate'

const DAY_MS = 24 * 60 * 60 * 1000

interface HistoryPageViewModelInput {
  isLoading: boolean
  hasError: boolean
  historyCount: number
  formatSubtitle: (count: number) => string
}

interface HistoryEntryCardViewModelInput {
  position: number
}

type HistoryPageViewState = 'loading' | 'error' | 'empty' | 'results'

export function buildHistoryDocumentTitle(defaultTitle: string) {
  return defaultTitle
}

export function formatHistoryEntryDate({
  timestamp,
  now,
  locale,
  t,
  formatNumber,
}: {
  timestamp: number
  now: number
  locale: Locale
  t: (key: string) => string
  formatNumber: (value: number) => string
}) {
  const date = new Date(timestamp)
  const days = Math.floor((now - date.getTime()) / DAY_MS)

  if (days === 0) {
    return t('history.today')
  }
  if (days === 1) {
    return t('history.yesterday')
  }
  if (days < 7) {
    return formatCountTemplate({
      template: t('history.daysAgo'),
      count: days,
      formatNumber,
    })
  }

  return date.toLocaleDateString(getIntlLocale(locale))
}

export function buildHistoryEntryDateFormatter({
  now = Date.now(),
  locale,
  t,
  formatNumber,
}: {
  now?: number
  locale: Locale
  t: (key: string) => string
  formatNumber: (value: number) => string
}) {
  return (timestamp: number) =>
    formatHistoryEntryDate({
      timestamp,
      now,
      locale,
      t,
      formatNumber,
    })
}

export function buildHistoryListRequestPath(limit: number) {
  return `/history/novels?limit=${limit}`
}

export function buildHistorySubtitle({
  template,
  count,
  formatNumber,
}: {
  template: string
  count: number
  formatNumber: (value: number) => string
}) {
  return formatCountTemplate({ template, count, formatNumber })
}

export function getHistoryLoadErrorMessage(error: unknown, fallbackMessage: string) {
  return getErrorMessage(error, fallbackMessage)
}

export function buildHistoryPageViewModel({
  isLoading,
  hasError,
  historyCount,
  formatSubtitle,
}: HistoryPageViewModelInput) {
  const state: HistoryPageViewState = isLoading
    ? 'loading'
    : hasError
      ? 'error'
      : historyCount > 0
        ? 'results'
        : 'empty'

  return {
    state,
    subtitle: formatSubtitle(historyCount),
  }
}

export function buildHistoryEntryCardViewModel({
  position,
}: HistoryEntryCardViewModelInput) {
  return {
    showContinue: position > 0,
  }
}

export function isHistoryEntryActivationKey(key: string) {
  return key === 'Enter' || key === ' '
}
