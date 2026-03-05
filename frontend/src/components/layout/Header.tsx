import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSearchKeywordRules } from '../../contexts/SearchKeywordRulesContext'
import { useI18n } from '../../i18n/useI18n'
import { useLocaleStore } from '../../stores/localeStore'

export default function Header() {
  const { locale, t } = useI18n()
  const { pathname } = useLocation()
  const toggleLocale = useLocaleStore((state) => state.toggleLocale)
  const {
    blockedWordsInput,
    highlightWordsInput,
    blockedWords,
    highlightWords,
    setBlockedWordsInput,
    setHighlightWordsInput,
  } = useSearchKeywordRules()
  const [isRulesPanelOpen, setIsRulesPanelOpen] = useState(false)
  const rulesPanelRef = useRef<HTMLDivElement | null>(null)

  const isSearchRoute = pathname.startsWith('/search')
  const ruleCount = useMemo(() => blockedWords.length + highlightWords.length, [blockedWords.length, highlightWords.length])

  useEffect(() => {
    if (!isSearchRoute) {
      setIsRulesPanelOpen(false)
      return
    }

    if (!isRulesPanelOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rulesPanelRef.current) return
      const targetNode = event.target as Node | null
      if (targetNode && !rulesPanelRef.current.contains(targetNode)) {
        setIsRulesPanelOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isRulesPanelOpen, isSearchRoute])

  return (
    <header className="bg-white border-b border-border/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl md:text-2xl font-bold text-primary tracking-tight hover:scale-105 transition-transform duration-200">
              Pixvel
            </Link>
          </div>

          <nav className="flex items-center space-x-3 md:space-x-5">
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
            <div className="flex items-center gap-2 pl-1" ref={rulesPanelRef}>
              {isSearchRoute && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsRulesPanelOpen((previous) => !previous)}
                    aria-expanded={isRulesPanelOpen}
                    aria-label={t('search.keywordRules.button')}
                    className="min-h-[44px] px-3 md:px-3.5 rounded-lg bg-muted text-xs md:text-sm font-semibold text-foreground border border-border/60 hover:border-primary/50 hover:text-primary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex items-center gap-2"
                  >
                    <span>{t('search.keywordRules.button')}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] md:text-xs leading-none">
                      {t('search.keywordRules.badge')} {ruleCount}
                    </span>
                  </button>

                  {isRulesPanelOpen && (
                    <div className="absolute right-0 mt-2 w-[min(90vw,20rem)] rounded-xl border border-border/70 bg-white shadow-xl p-3 md:p-4">
                      <div className="space-y-3">
                        <label className="block">
                          <span className="block text-xs font-semibold text-foreground/80 mb-1">
                            {t('search.keywordRules.blockedLabel')}
                          </span>
                          <input
                            type="text"
                            value={blockedWordsInput}
                            onChange={(event) => setBlockedWordsInput(event.target.value)}
                            placeholder={t('search.keywordRules.blockedPlaceholder')}
                            className="w-full min-h-[44px] rounded-lg border border-border bg-muted/40 px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          />
                        </label>

                        <label className="block">
                          <span className="block text-xs font-semibold text-foreground/80 mb-1">
                            {t('search.keywordRules.highlightLabel')}
                          </span>
                          <input
                            type="text"
                            value={highlightWordsInput}
                            onChange={(event) => setHighlightWordsInput(event.target.value)}
                            placeholder={t('search.keywordRules.highlightPlaceholder')}
                            className="w-full min-h-[44px] rounded-lg border border-border bg-muted/40 px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          />
                        </label>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {t('search.keywordRules.hint')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={toggleLocale}
                aria-label={t('header.toggleLocale')}
                title={t('header.toggleLocale')}
                className="w-11 h-11 md:w-10 md:h-10 rounded-lg bg-muted flex items-center justify-center hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
