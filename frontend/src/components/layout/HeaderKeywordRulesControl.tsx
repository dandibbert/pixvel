import { useI18n } from '../../i18n/useI18n'

interface HeaderKeywordRulesControlProps {
  panelId: string
  isOpen: boolean
  ruleCount: number
  blockedWordsInput: string
  highlightWordsInput: string
  onToggle: () => void
  onBlockedWordsInputChange: (value: string) => void
  onHighlightWordsInputChange: (value: string) => void
}

export function HeaderKeywordRulesControl({
  panelId,
  isOpen,
  ruleCount,
  blockedWordsInput,
  highlightWordsInput,
  onToggle,
  onBlockedWordsInputChange,
  onHighlightWordsInputChange,
}: HeaderKeywordRulesControlProps) {
  const { t } = useI18n()

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={t('search.keywordRules.button')}
        title={t('search.keywordRules.button')}
        className="min-h-[44px] px-3 rounded-lg bg-muted text-xs md:text-sm font-semibold text-foreground border border-border/60 hover:border-primary/50 hover:text-primary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex items-center gap-2"
      >
        <span>{t('header.rulesCompact')}</span>
        <span className="px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] md:text-xs leading-none">
          {ruleCount}
        </span>
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="dialog"
          aria-label={t('search.keywordRules.button')}
          className="absolute right-0 mt-2 w-[min(90vw,20rem)] rounded-xl border border-border/70 bg-white shadow-xl p-3 md:p-4"
        >
          <div className="space-y-3">
            <label className="block">
              <span className="block text-xs font-semibold text-foreground/80 mb-1">
                {t('search.keywordRules.blockedLabel')}
              </span>
              <input
                type="text"
                value={blockedWordsInput}
                onInput={(event) => onBlockedWordsInputChange(event.currentTarget.value)}
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
                onInput={(event) => onHighlightWordsInputChange(event.currentTarget.value)}
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
  )
}
