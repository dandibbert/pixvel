export type Locale = 'zh' | 'ja'
export interface LocaleStateFragment {
  locale: Locale
}

export function getDefaultLocaleFromLanguage(language: string | undefined): Locale {
  return language?.toLowerCase().startsWith('ja') ? 'ja' : 'zh'
}

export function buildLocaleSetState(locale: Locale): LocaleStateFragment {
  return { locale }
}

export function buildLocaleToggleState(locale: Locale): LocaleStateFragment {
  return {
    locale: locale === 'zh' ? 'ja' : 'zh',
  }
}
