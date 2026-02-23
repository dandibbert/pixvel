import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'zh' | 'ja'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const getDefaultLocale = (): Locale => {
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ja')) {
    return 'ja'
  }
  return 'zh'
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: getDefaultLocale(),
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => set({ locale: get().locale === 'zh' ? 'ja' : 'zh' }),
    }),
    {
      name: 'locale-storage',
    }
  )
)
