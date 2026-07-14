import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n/useI18n'
import { useLocaleStore } from '../../stores/localeStore'

export default function Header() {
  const { locale, t } = useI18n()
  const { pathname } = useLocation()
  const toggleLocale = useLocaleStore((state) => state.toggleLocale)
  const isSearchRoute = pathname.startsWith('/search')

  return (
    <header className="bg-white border-b border-border/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          <Link
            to="/"
            className="text-xl md:text-2xl font-bold text-primary tracking-tight hover:scale-105 transition-transform duration-200"
          >
            Pixvel
          </Link>

          <nav className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-1">
              <Link
                to="/search"
                aria-current={isSearchRoute ? 'page' : undefined}
                className={`min-h-[44px] px-3 rounded-md text-sm font-semibold transition-all duration-200 flex items-center justify-center leading-none ${
                  isSearchRoute ? 'bg-white text-primary shadow-sm' : 'text-foreground hover:text-primary'
                }`}
              >
                {t('header.search')}
              </Link>
              <Link
                to="/history"
                aria-current={pathname.startsWith('/history') ? 'page' : undefined}
                className={`min-h-[44px] px-3 rounded-md text-sm font-semibold transition-all duration-200 flex items-center justify-center leading-none ${
                  pathname.startsWith('/history') ? 'bg-white text-primary shadow-sm' : 'text-foreground hover:text-primary'
                }`}
              >
                {t('header.history')}
              </Link>
            </div>

            <button
              type="button"
              onClick={toggleLocale}
              aria-label={t('header.toggleLocale')}
              title={t('header.toggleLocale')}
              className="w-11 h-11 md:w-10 md:h-10 rounded-lg bg-muted flex items-center justify-center hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-[9px] md:text-[10px] font-black text-primary">
                {locale === 'ja' ? '日' : '中'}
              </span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
