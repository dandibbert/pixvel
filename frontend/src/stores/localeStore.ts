import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  buildLocaleSetState,
  buildLocaleToggleState,
  getDefaultLocaleFromLanguage,
  type Locale,
} from './localeStoreModel'

export type { Locale } from './localeStoreModel'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const getDefaultLocale = (): Locale => {
  return getDefaultLocaleFromLanguage(
    typeof navigator === 'undefined' ? undefined : navigator.language,
  )
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: getDefaultLocale(),
      setLocale: (locale) => set(buildLocaleSetState(locale)),
      toggleLocale: () => set(buildLocaleToggleState(get().locale)),
    }),
    {
      name: 'locale-storage',
    }
  )
)
