import { useState } from 'react'
import { useI18n } from '../../i18n/useI18n'

type SearchTarget = 'partial_match_for_tags' | 'exact_match_for_tags' | 'text' | 'keyword'
type SearchLang = 'ja' | 'zh-CN'
type SearchAiType = '0' | '1'

interface FilterPanelProps {
  searchTarget: SearchTarget
  startDate: string
  endDate: string
  bookmarkNum: number
  bookmarkNumMin: number
  bookmarkNumMax: number
  textLengthMin: number
  lang: SearchLang
  includePotentialViolationWorks: boolean
  includeTranslatedTagResults: boolean
  isOriginalOnly: boolean
  isReplaceableOnly: boolean
  mergePlainKeywordResults: boolean
  searchAiType: SearchAiType
  onSearchTargetChange: (target: SearchTarget) => void
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onBookmarkNumChange: (num: number) => void
  onBookmarkNumMinChange: (num: number) => void
  onBookmarkNumMaxChange: (num: number) => void
  onTextLengthMinChange: (num: number) => void
  onLangChange: (lang: SearchLang) => void
  onIncludePotentialViolationWorksChange: (value: boolean) => void
  onIncludeTranslatedTagResultsChange: (value: boolean) => void
  onIsOriginalOnlyChange: (value: boolean) => void
  onIsReplaceableOnlyChange: (value: boolean) => void
  onMergePlainKeywordResultsChange: (value: boolean) => void
  onSearchAiTypeChange: (value: SearchAiType) => void
  onApply: () => void
}

function toNumber(value: string) {
  return Number(value) || 0
}

export default function FilterPanel({
  searchTarget,
  startDate,
  endDate,
  bookmarkNum,
  bookmarkNumMin,
  bookmarkNumMax,
  textLengthMin,
  lang,
  includePotentialViolationWorks,
  includeTranslatedTagResults,
  isOriginalOnly,
  isReplaceableOnly,
  mergePlainKeywordResults,
  searchAiType,
  onSearchTargetChange,
  onStartDateChange,
  onEndDateChange,
  onBookmarkNumChange,
  onBookmarkNumMinChange,
  onBookmarkNumMaxChange,
  onTextLengthMinChange,
  onLangChange,
  onIncludePotentialViolationWorksChange,
  onIncludeTranslatedTagResultsChange,
  onIsOriginalOnlyChange,
  onIsReplaceableOnlyChange,
  onMergePlainKeywordResultsChange,
  onSearchAiTypeChange,
  onApply,
}: FilterPanelProps) {
  const { t, searchTargetLabel } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const searchTargetOptions: SearchTarget[] = [
    'partial_match_for_tags',
    'exact_match_for_tags',
    'keyword',
    'text',
  ]

  const activeFilterCount = [
    searchTarget !== 'keyword',
    Boolean(startDate),
    Boolean(endDate),
    bookmarkNum > 0 || bookmarkNumMin > 0,
    bookmarkNumMax > 0,
    textLengthMin > 0,
    lang !== 'ja',
    includePotentialViolationWorks,
    !includeTranslatedTagResults,
    isOriginalOnly,
    isReplaceableOnly,
    !mergePlainKeywordResults,
    searchAiType !== '1',
  ].filter(Boolean).length

  const resetFilters = () => {
    setValidationErrors([])
    onSearchTargetChange('keyword')
    onStartDateChange('')
    onEndDateChange('')
    onBookmarkNumChange(0)
    onBookmarkNumMinChange(0)
    onBookmarkNumMaxChange(0)
    onTextLengthMinChange(0)
    onLangChange('ja')
    onIncludePotentialViolationWorksChange(false)
    onIncludeTranslatedTagResultsChange(true)
    onIsOriginalOnlyChange(false)
    onIsReplaceableOnlyChange(false)
    onMergePlainKeywordResultsChange(true)
    onSearchAiTypeChange('1')
  }

  const applyFilters = () => {
    const nextValidationErrors = []

    if (startDate && endDate && startDate > endDate) {
      nextValidationErrors.push(t('filter.dateRangeInvalid'))
    }
    if (bookmarkNumMax > 0 && (bookmarkNumMin || bookmarkNum) > bookmarkNumMax) {
      nextValidationErrors.push(t('filter.bookmarkRangeInvalid'))
    }

    setValidationErrors(nextValidationErrors)
    if (nextValidationErrors.length > 0) return

    onApply()
    setIsOpen(false)
  }

  const closeOnOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-3 h-14 px-6 bg-muted rounded-lg hover:scale-105 active:scale-95 transition-all"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <svg
          className="w-5 h-5 text-foreground/40"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="text-sm font-black text-foreground/60 uppercase tracking-widest">{t('filter.title')}</span>
        {activeFilterCount > 0 && (
          <span className="min-w-6 h-6 px-2 bg-primary text-white rounded-full text-xs font-black flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          data-testid="filter-overlay"
          className="fixed inset-0 z-30 bg-black/35 backdrop-blur-[2px] flex items-end overflow-y-auto overscroll-contain p-2 md:items-start md:justify-end md:p-8"
          onClick={closeOnOverlayClick}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('filter.title')}
            className="w-full md:w-[28rem] max-h-[calc(100dvh-1rem)] md:max-h-[86vh] overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] bg-white border-t-8 md:border-4 border-primary rounded-t-2xl md:rounded-xl p-6 md:p-8 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">{t('filter.title')}</h2>
                <p className="mt-2 text-xs font-bold text-foreground/40 uppercase tracking-widest">
                  Pixiv App API
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 bg-muted rounded-lg text-foreground/40 hover:text-accent transition-colors font-black"
                aria-label={t('filter.close')}
              >
                ×
              </button>
            </div>

            <section className="mb-6 p-4 bg-muted/70 rounded-xl border-2 border-muted">
              <h3 className="text-xs font-black text-foreground/40 mb-3 uppercase tracking-widest">
                {t('filter.searchMode')}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {searchTargetOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onSearchTargetChange(option)}
                    className={`h-11 rounded-lg text-xs font-black transition-all ${
                      searchTarget === option
                        ? 'bg-primary text-white shadow-md scale-[1.02]'
                        : 'bg-white text-foreground/50 hover:text-foreground'
                    }`}
                  >
                    {searchTargetLabel(option)}
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-6 p-4 bg-muted/70 rounded-xl border-2 border-muted">
              <h3 className="text-xs font-black text-foreground/40 mb-3 uppercase tracking-widest">
                {t('filter.publishDateRange')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                  {t('filter.dateStart')}
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => onStartDateChange(event.target.value)}
                    onInput={(event) => onStartDateChange(event.currentTarget.value)}
                    className="mt-2 w-full h-11 px-3 bg-white rounded-lg font-bold text-sm focus:ring-4 focus:ring-primary/20"
                  />
                </label>
                <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                  {t('filter.dateEnd')}
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => onEndDateChange(event.target.value)}
                    onInput={(event) => onEndDateChange(event.currentTarget.value)}
                    className="mt-2 w-full h-11 px-3 bg-white rounded-lg font-bold text-sm focus:ring-4 focus:ring-primary/20"
                  />
                </label>
                <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                  {t('filter.bookmarkMin')}
                  <input
                    type="number"
                    value={bookmarkNumMin || bookmarkNum || ''}
                    onChange={(event) => {
                      const value = toNumber(event.target.value)
                      onBookmarkNumMinChange(value)
                      onBookmarkNumChange(value)
                    }}
                    min="0"
                    placeholder={t('filter.noLimit')}
                    className="mt-2 w-full h-11 px-3 bg-white rounded-lg font-bold text-sm focus:ring-4 focus:ring-primary/20"
                  />
                </label>
                <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                  {t('filter.bookmarkMax')}
                  <input
                    type="number"
                    value={bookmarkNumMax || ''}
                    onChange={(event) => onBookmarkNumMaxChange(toNumber(event.target.value))}
                    min="0"
                    placeholder={t('filter.noLimit')}
                    className="mt-2 w-full h-11 px-3 bg-white rounded-lg font-bold text-sm focus:ring-4 focus:ring-primary/20"
                  />
                </label>
                <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                  {t('filter.textLengthMin')}
                  <input
                    type="number"
                    value={textLengthMin || ''}
                    onChange={(event) => onTextLengthMinChange(toNumber(event.target.value))}
                    min="0"
                    placeholder={t('filter.noLimit')}
                    className="mt-2 w-full h-11 px-3 bg-white rounded-lg font-bold text-sm focus:ring-4 focus:ring-primary/20"
                  />
                </label>
                <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                  {t('filter.lang')}
                  <select
                    value={lang}
                    onChange={(event) => onLangChange(event.target.value as SearchLang)}
                    className="mt-2 w-full h-11 px-3 bg-white rounded-lg font-bold text-sm focus:ring-4 focus:ring-primary/20"
                  >
                    <option value="ja">ja</option>
                    <option value="zh-CN">zh-CN</option>
                  </select>
                </label>
              </div>
              <p className="mt-3 text-xs font-bold text-foreground/35">{t('filter.noLimit')}</p>
            </section>

            <section className="mb-6 p-4 bg-muted/70 rounded-xl border-2 border-muted">
              <h3 className="text-xs font-black text-foreground/40 mb-3 uppercase tracking-widest">
                {t('filter.content')}
              </h3>
              <div className="space-y-3">
                <SwitchRow label={t('filter.originalOnly')} checked={isOriginalOnly} onChange={onIsOriginalOnlyChange} />
                <SwitchRow
                  label={t('filter.excludeAi')}
                  checked={searchAiType === '1'}
                  onChange={(checked) => onSearchAiTypeChange(checked ? '1' : '0')}
                />
                <SwitchRow
                  label={t('filter.includePotentialViolation')}
                  checked={includePotentialViolationWorks}
                  onChange={onIncludePotentialViolationWorksChange}
                />
              </div>
            </section>

            <section className="mb-6 p-4 bg-muted/70 rounded-xl border-2 border-muted">
              <h3 className="text-xs font-black text-foreground/40 mb-3 uppercase tracking-widest">
                {t('filter.matching')}
              </h3>
              <div className="space-y-3">
                <SwitchRow
                  label={t('filter.includeTranslatedTags')}
                  checked={includeTranslatedTagResults}
                  onChange={onIncludeTranslatedTagResultsChange}
                />
                <SwitchRow
                  label={t('filter.mergePlainKeyword')}
                  checked={mergePlainKeywordResults}
                  onChange={onMergePlainKeywordResultsChange}
                />
                <SwitchRow
                  label={t('filter.replaceableOnly')}
                  checked={isReplaceableOnly}
                  onChange={onIsReplaceableOnlyChange}
                />
              </div>
            </section>

            {validationErrors.length > 0 && (
              <div className="mb-4 space-y-2 rounded-lg border-2 border-accent/20 bg-accent/10 p-3">
                {validationErrors.map((error) => (
                  <p key={error} className="text-xs font-black text-accent uppercase tracking-widest">
                    {error}
                  </p>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 h-12 px-6 bg-muted text-foreground/40 font-black rounded-lg hover:text-accent transition-all uppercase tracking-widest text-xs"
              >
                {t('filter.reset')}
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="flex-[2] h-12 px-6 bg-primary text-white font-black rounded-lg hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
              >
                {t('filter.apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 p-3 bg-white rounded-lg cursor-pointer">
      <span className="text-sm font-black text-foreground/70">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="w-5 h-5 accent-primary"
      />
    </label>
  )
}
