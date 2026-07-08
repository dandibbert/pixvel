import type { Locale } from '../stores/localeStoreModel'

export function getIntlLocale(locale: Locale) {
  return locale === 'ja' ? 'ja-JP' : 'zh-CN'
}
