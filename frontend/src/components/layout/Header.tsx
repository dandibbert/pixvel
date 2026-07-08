import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSearchKeywordRules } from '../../contexts/SearchKeywordRulesContext'
import { useEventListener } from '../../hooks/useEventListener'
import { useI18n } from '../../i18n/useI18n'
import { useLocaleStore } from '../../stores/localeStore'
import { HeaderKeywordRulesControl } from './HeaderKeywordRulesControl'

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
  const rulesPanelId = 'header-keyword-rules-panel'

  const isSearchRoute = pathname.startsWith('/search')
  const ruleCount = useMemo(() => blockedWords.length + highlightWords.length, [blockedWords.length, highlightWords.length])
  const rulesPanelEventTarget = isSearchRoute && isRulesPanelOpen ? document : null

  useEffect(() => {
    if (!isSearchRoute) {
      setIsRulesPanelOpen(false)
    }
  }, [isSearchRoute])

  useEventListener(rulesPanelEventTarget, 'pointerdown', (event) => {
    if (!rulesPanelRef.current) return
    const targetNode = event.target as Node | null
    if (targetNode && !rulesPanelRef.current.contains(targetNode)) {
      setIsRulesPanelOpen(false)
    }
  })

  useEventListener(rulesPanelEventTarget, 'keydown', (event) => {
    if ((event as KeyboardEvent).key === 'Escape') {
      setIsRulesPanelOpen(false)
    }
  })

  return (
    <header className="bg-white border-b border-border/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl md:text-2xl font-bold text-primary tracking-tight hover:scale-105 transition-transform duration-200">
              Pixvel
            </Link>
          </div>

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
            <div className="flex items-center gap-2" ref={rulesPanelRef}>
              {isSearchRoute && (
                <HeaderKeywordRulesControl
                  panelId={rulesPanelId}
                  isOpen={isRulesPanelOpen}
                  ruleCount={ruleCount}
                  blockedWordsInput={blockedWordsInput}
                  highlightWordsInput={highlightWordsInput}
                  onToggle={() => setIsRulesPanelOpen((previous) => !previous)}
                  onBlockedWordsInputChange={setBlockedWordsInput}
                  onHighlightWordsInputChange={setHighlightWordsInput}
                />
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
