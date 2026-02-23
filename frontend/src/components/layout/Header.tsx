import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n/useI18n'
import { useLocaleStore } from '../../stores/localeStore'

export default function Header() {
  const { locale, t } = useI18n()
  const toggleLocale = useLocaleStore((state) => state.toggleLocale)

  return (
    <header className="bg-white border-b border-border/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl md:text-2xl font-bold text-primary tracking-tight hover:scale-105 transition-transform duration-200">
              Pixvel
            </Link>
          </div>

          <nav className="flex items-center space-x-4 md:space-x-6">
            <Link
              to="/search"
              className="text-sm md:text-base font-semibold text-foreground hover:text-primary transition-all duration-200 min-h-[44px] flex items-center"
            >
              {t('header.search')}
            </Link>
            <Link
              to="/history"
              className="text-sm md:text-base font-semibold text-foreground hover:text-primary transition-all duration-200 min-h-[44px] flex items-center"
            >
              {t('header.history')}
            </Link>
            <div className="flex items-center pl-2">
              <button
                type="button"
                onClick={toggleLocale}
                aria-label={t('header.toggleLocale')}
                title={t('header.toggleLocale')}
                className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-muted flex items-center justify-center hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-[9px] md:text-[10px] font-black text-primary">
                  {locale === 'ja' ? '日' : '中'}
                </div>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
