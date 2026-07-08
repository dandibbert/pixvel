import { useI18n } from '../../i18n/useI18n'
import {
  buildBookmarkMinimumUpdate,
  parseNumberInput,
  type SearchLang,
} from './filterPanelModel'

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

  const updateBookmarkMinimum = (value: string) => {
    const update = buildBookmarkMinimumUpdate(value)
    onBookmarkNumMinChange(update.bookmarkNumMin)
    onBookmarkNumChange(update.bookmarkNum)
  }

  return (
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
            onInput={(event) => updateBookmarkMinimum(event.currentTarget.value)}
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
            onInput={(event) => onBookmarkNumMaxChange(parseNumberInput(event.currentTarget.value))}
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
            onInput={(event) => onTextLengthMinChange(parseNumberInput(event.currentTarget.value))}
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
  )
}
