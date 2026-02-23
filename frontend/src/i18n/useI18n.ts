import { useCallback, useMemo } from 'react'
import { messages } from './messages'
import { Locale, useLocaleStore } from '../stores/localeStore'

type SearchTarget = 'partial_match_for_tags' | 'exact_match_for_tags' | 'text' | 'keyword'
type SearchSort = 'date_desc' | 'date_asc' | 'popular_desc'

export function useI18n() {
  const locale = useLocaleStore((state) => state.locale)

  const t = useCallback(
    (key: string): string => {
      return messages[locale][key] ?? messages.zh[key] ?? key
    },
    [locale]
  )

  const formatter = useMemo(
    () => new Intl.NumberFormat(locale === 'ja' ? 'ja-JP' : 'zh-CN'),
    [locale]
  )

  const formatNumber = useCallback(
    (value: number) => formatter.format(value),
    [formatter]
  )

  const searchTargetLabel = useCallback(
    (target: SearchTarget) => t(`search.target.${target}`),
    [t]
  )

  const sortLabel = useCallback(
    (sort: SearchSort) => t(`sort.${sort}`),
    [t]
  )

  return {
    locale: locale as Locale,
    t,
    formatNumber,
    searchTargetLabel,
    sortLabel,
  }
}
