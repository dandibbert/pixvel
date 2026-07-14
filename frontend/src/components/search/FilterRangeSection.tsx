import { useRef } from 'react'
import { useI18n } from '../../i18n/useI18n'
import {
  buildBookmarkMinimumUpdate,
  parseNumberInput,
  type SearchLang,
} from './filterPanelModel'
import {
  BOOKMARK_PRESETS,
  buildDatePresetRange,
  DATE_PRESETS,
  formatDateInputValue,
  isValidIsoDate,
  normalizeDateInput,
  type DatePreset,
} from './filterRangeModel'

interface FilterRangeSectionProps {
  startDate: string
  endDate: string
  bookmarkNum: number
  bookmarkNumMin: number
  bookmarkNumMax: number
  textLengthMin: number
  lang: SearchLang
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onBookmarkNumChange: (num: number) => void
  onBookmarkNumMinChange: (num: number) => void
  onBookmarkNumMaxChange: (num: number) => void
  onTextLengthMinChange: (num: number) => void
  onLangChange: (lang: SearchLang) => void
}

export default function FilterRangeSection({
  startDate,
  endDate,
  bookmarkNum,
  bookmarkNumMin,
  bookmarkNumMax,
  textLengthMin,
  lang,
  onStartDateChange,
  onEndDateChange,
  onBookmarkNumChange,
  onBookmarkNumMinChange,
  onBookmarkNumMaxChange,
  onTextLengthMinChange,
  onLangChange,
}: FilterRangeSectionProps) {
  const { t } = useI18n()
  const startDatePickerRef = useRef<HTMLInputElement>(null)
  const endDatePickerRef = useRef<HTMLInputElement>(null)
  const effectiveBookmarkMinimum = bookmarkNumMin || bookmarkNum

  const updateBookmarkMinimum = (value: string) => {
    const update = buildBookmarkMinimumUpdate(value)
    onBookmarkNumMinChange(update.bookmarkNumMin)
    onBookmarkNumChange(update.bookmarkNum)
  }

  const applyDatePreset = (preset: DatePreset) => {
    const range = buildDatePresetRange(preset)
    onStartDateChange(range.startDate)
    onEndDateChange(range.endDate)
  }

  const applyBookmarkPreset = (minimum: number) => {
    onBookmarkNumMinChange(minimum)
    onBookmarkNumChange(minimum)
    onBookmarkNumMaxChange(0)
  }

  const isDatePresetSelected = (preset: DatePreset) => {
    const range = buildDatePresetRange(preset)
    return startDate === range.startDate && endDate === range.endDate
  }

  return (
    <section className="mb-6 space-y-4">
      <div className="p-4 bg-muted/70 rounded-xl border-2 border-muted">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-xs font-black text-foreground/55 uppercase tracking-widest">
            {t('filter.publishDateRange')}
          </h3>
          {(startDate || endDate) && (
            <span className="text-[10px] font-bold text-primary">
              {formatDateInputValue(startDate) || t('filter.noLimit')}
              {' — '}
              {formatDateInputValue(endDate) || t('filter.noLimit')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {DATE_PRESETS.map((preset) => {
            const isSelected = isDatePresetSelected(preset)

            return (
              <button
                key={preset}
                type="button"
                onClick={() => applyDatePreset(preset)}
                className={`min-h-[44px] rounded-lg px-2 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-white text-foreground/60 border border-border hover:border-primary/50 hover:text-primary'
                }`}
              >
                {t(`filter.datePreset.${preset}`)}
              </button>
            )
          })}
        </div>

        <div
          data-date-input-grid
          className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <DirectDateInput
            label={t('filter.dateStart')}
            hint={t('filter.dateInputHint')}
            calendarLabel={t('filter.openStartDateCalendar')}
            value={startDate}
            pickerRef={startDatePickerRef}
            onChange={onStartDateChange}
          />
          <DirectDateInput
            label={t('filter.dateEnd')}
            hint={t('filter.dateInputHint')}
            calendarLabel={t('filter.openEndDateCalendar')}
            value={endDate}
            pickerRef={endDatePickerRef}
            onChange={onEndDateChange}
          />
        </div>
      </div>

      <div className="p-4 bg-muted/70 rounded-xl border-2 border-muted">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-xs font-black text-foreground/55 uppercase tracking-widest">
            {t('filter.bookmarkRange')}
          </h3>
          {(effectiveBookmarkMinimum > 0 || bookmarkNumMax > 0) && (
            <span className="text-[10px] font-bold text-primary">
              {effectiveBookmarkMinimum || 0}
              {' — '}
              {bookmarkNumMax || t('filter.noLimit')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {BOOKMARK_PRESETS.map((minimum) => {
            const isSelected =
              effectiveBookmarkMinimum === minimum &&
              bookmarkNumMax === 0

            return (
              <button
                key={minimum}
                type="button"
                onClick={() => applyBookmarkPreset(minimum)}
                className={`min-h-[44px] rounded-lg px-2 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-white text-foreground/60 border border-border hover:border-primary/50 hover:text-primary'
                }`}
              >
                {t(`filter.bookmarkPreset.${minimum}`)}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <DirectNumberInput
            label={t('filter.bookmarkMin')}
            hint={t('filter.bookmarkInputHint')}
            value={effectiveBookmarkMinimum}
            onChange={updateBookmarkMinimum}
          />
          <DirectNumberInput
            label={t('filter.bookmarkMax')}
            hint={t('filter.bookmarkInputHint')}
            value={bookmarkNumMax}
            onChange={(value) => onBookmarkNumMaxChange(parseNumberInput(value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 bg-muted/70 rounded-xl border-2 border-muted">
        <label className="block text-[10px] font-black text-foreground/45 uppercase tracking-widest">
          {t('filter.textLengthMin')}
          <input
            type="number"
            inputMode="numeric"
            value={textLengthMin || ''}
            onInput={(event) => onTextLengthMinChange(parseNumberInput(event.currentTarget.value))}
            min="0"
            placeholder={t('filter.noLimit')}
            className="mt-2 w-full min-h-[44px] px-3 bg-white border border-border rounded-lg font-bold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>
        <label className="block text-[10px] font-black text-foreground/45 uppercase tracking-widest">
          {t('filter.lang')}
          <select
            value={lang}
            onChange={(event) => onLangChange(event.target.value as SearchLang)}
            className="mt-2 w-full min-h-[44px] px-3 bg-white border border-border rounded-lg font-bold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="ja">ja</option>
            <option value="zh-CN">zh-CN</option>
          </select>
        </label>
      </div>
    </section>
  )
}

function DirectDateInput({
  label,
  hint,
  calendarLabel,
  value,
  pickerRef,
  onChange,
}: {
  label: string
  hint: string
  calendarLabel: string
  value: string
  pickerRef: React.RefObject<HTMLInputElement>
  onChange: (value: string) => void
}) {
  const openPicker = () => {
    const picker = pickerRef.current
    if (!picker) return

    if (typeof picker.showPicker === 'function') {
      picker.showPicker()
      return
    }

    picker.click()
  }

  return (
    <div>
      <span className="block text-[10px] font-black text-foreground/45 uppercase tracking-widest">
        {label}
      </span>
      <div className="relative mt-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9/]*"
          maxLength={10}
          value={formatDateInputValue(value)}
          onInput={(event) => onChange(normalizeDateInput(event.currentTarget.value))}
          placeholder="YYYY/MM/DD"
          data-direct-date-input
          className="w-full min-h-[52px] pl-3 pr-12 bg-white border border-border rounded-lg font-bold text-base md:text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <button
          type="button"
          aria-label={calendarLabel}
          title={calendarLabel}
          onClick={openPicker}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <CalendarIcon />
        </button>
        <input
          ref={pickerRef}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          value={isValidIsoDate(value) ? value : ''}
          onInput={(event) => onChange(event.currentTarget.value)}
          data-native-date-input
          className="sr-only"
        />
      </div>
      <span className="mt-1 block text-[9px] font-semibold text-primary/75">
        {hint}
      </span>
    </div>
  )
}

function DirectNumberInput({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: number
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-[10px] font-black text-foreground/45 uppercase tracking-widest">
      {label}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value || ''}
        onInput={(event) => onChange(event.currentTarget.value)}
        data-bookmark-input
        className="mt-2 w-full min-h-[52px] px-3 bg-white border border-border rounded-lg font-bold text-base md:text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
      <span className="mt-1 block text-[9px] normal-case tracking-normal font-semibold text-primary/75">
        {hint}
      </span>
    </label>
  )
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="w-5 h-5 mx-auto"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  )
}
