import { useI18n } from '../../i18n/useI18n'
import type { SearchHistoryEntry } from '../../types/search'
import { buildSearchHistoryEntryMeta } from './searchHistoryMenuModel'

interface SearchHistoryMenuProps {
  entries: ReadonlyArray<SearchHistoryEntry>
  onEntryClick: (entry: SearchHistoryEntry) => void
  onRemoveEntry: (index: number) => void
  onClear: () => void
  onClose: () => void
}

export default function SearchHistoryMenu({
  entries,
  onEntryClick,
  onRemoveEntry,
  onClear,
  onClose,
}: SearchHistoryMenuProps) {
  const { t, formatNumber, searchTargetLabel, sortLabel } = useI18n()

  return (
    <div className="absolute z-20 w-full mt-4 bg-white rounded-lg border-4 border-primary overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-muted border-b-2 border-primary/10">
        <span className="text-xs font-black text-foreground/40 uppercase tracking-widest">{t('search.historyRecent')}</span>
        <div className="flex gap-6">
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-black text-foreground/40 hover:text-accent transition-colors"
          >
            {t('search.historyClear')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-black text-primary hover:scale-110 transition-transform"
          >
            {t('search.historyClose')}
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {entries.map((entry, index) => {
          const entryMeta = buildSearchHistoryEntryMeta({
            entry,
            bookmarkSuffix: t('search.historyBookmarkSuffix'),
            formatNumber,
            searchTargetLabel,
            sortLabel,
          })

          return (
            <div
              key={index}
              data-testid="search-history-entry"
              className="group flex items-center justify-between px-6 py-4 hover:bg-muted cursor-pointer border-b-2 border-muted last:border-0 transition-all"
              onClick={() => onEntryClick(entry)}
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-foreground/20 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="min-w-0">
                  <div className="text-lg font-bold text-foreground truncate">{entryMeta.query}</div>
                  <div className="text-[10px] font-black text-foreground/30 flex items-center gap-3 truncate uppercase tracking-widest">
                    <span className="bg-muted px-2 py-0.5 rounded">{entryMeta.targetLabel}</span>
                    <span>{entryMeta.sortLabel}</span>
                    {entryMeta.bookmarkLabel && (
                      <span className="text-primary">
                        {entryMeta.bookmarkLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label={entryMeta.removeAriaLabel}
                onClick={(event) => {
                  event.stopPropagation()
                  onRemoveEntry(index)
                }}
                className="text-foreground/10 hover:text-accent p-2 opacity-0 group-hover:opacity-100 transition-all hover:scale-125"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
