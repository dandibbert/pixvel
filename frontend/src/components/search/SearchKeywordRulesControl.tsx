import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchKeywordRules } from '../../contexts/SearchKeywordRulesContext'
import { useI18n } from '../../i18n/useI18n'

export default function SearchKeywordRulesControl() {
  const { t } = useI18n()
  const {
    blockedWordsInput,
    highlightWordsInput,
    blockedWords,
    highlightWords,
    setBlockedWordsInput,
    setHighlightWordsInput,
  } = useSearchKeywordRules()
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const dialogId = 'search-keyword-rules-dialog'
  const ruleCount = useMemo(
    () => blockedWords.length + highlightWords.length,
    [blockedWords.length, highlightWords.length],
  )

  const close = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!isOpen) return

    firstInputRef.current?.focus()

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
      }
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-controls={dialogId}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={t('search.keywordRules.button')}
        className="min-h-[44px] px-3 rounded-lg border border-primary/35 bg-white text-xs font-bold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex items-center gap-2"
      >
        <span>{t('search.keywordRules.button')}</span>
        {ruleCount > 0 && (
          <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-[10px] leading-none flex items-center justify-center">
            {ruleCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          data-testid="keyword-rules-overlay"
          className="fixed inset-0 z-[60] flex items-end bg-black/40 p-2 pb-[max(.5rem,env(safe-area-inset-bottom))] backdrop-blur-[2px] md:items-start md:justify-end md:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              close()
            }
          }}
        >
          <div
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-label={t('search.keywordRules.button')}
            className="w-full max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-t-2xl border border-border bg-white p-5 shadow-2xl md:w-80 md:rounded-xl md:p-4"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border md:hidden" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-foreground">
                  {t('search.keywordRules.button')}
                </h2>
                <p className="mt-1 mb-0 text-xs text-foreground/50">
                  {ruleCount} {t('search.keywordRules.activeSuffix')}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={t('search.keywordRules.close')}
                className="w-11 h-11 rounded-xl bg-muted text-foreground/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span aria-hidden="true" className="text-xl leading-none">×</span>
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="block text-xs font-bold text-foreground/75 mb-1.5">
                  {t('search.keywordRules.blockedLabel')}
                </span>
                <input
                  ref={firstInputRef}
                  type="text"
                  value={blockedWordsInput}
                  onInput={(event) => setBlockedWordsInput(event.currentTarget.value)}
                  placeholder={t('search.keywordRules.blockedPlaceholder')}
                  className="w-full min-h-[48px] rounded-xl border border-border bg-muted/50 px-3 text-sm text-foreground placeholder:text-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-foreground/75 mb-1.5">
                  {t('search.keywordRules.highlightLabel')}
                </span>
                <input
                  type="text"
                  value={highlightWordsInput}
                  onInput={(event) => setHighlightWordsInput(event.currentTarget.value)}
                  placeholder={t('search.keywordRules.highlightPlaceholder')}
                  className="w-full min-h-[48px] rounded-xl border border-border bg-muted/50 px-3 text-sm text-foreground placeholder:text-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </label>

              <p className="mb-0 text-xs leading-relaxed text-foreground/50">
                {t('search.keywordRules.hint')}
              </p>

              <button
                type="button"
                onClick={close}
                className="w-full min-h-[48px] rounded-xl bg-primary px-4 text-sm font-black text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {t('search.keywordRules.done')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
