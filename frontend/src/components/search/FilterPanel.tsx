import { useState } from 'react'

interface FilterPanelProps {
  searchTarget: 'partial_match_for_tags' | 'exact_match_for_tags' | 'text' | 'keyword'
  startDate: string
  endDate: string
  bookmarkNum: number
  onSearchTargetChange: (target: 'partial_match_for_tags' | 'exact_match_for_tags' | 'text' | 'keyword') => void
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onBookmarkNumChange: (num: number) => void
  onApply: () => void
}

export default function FilterPanel({
  searchTarget,
  startDate,
  endDate,
  bookmarkNum,
  onSearchTargetChange,
  onStartDateChange,
  onEndDateChange,
  onBookmarkNumChange,
  onApply,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const searchTargetOptions = [
    { value: 'partial_match_for_tags' as const, label: '标签部分匹配' },
    { value: 'exact_match_for_tags' as const, label: '标签精确匹配' },
    { value: 'text' as const, label: '文本搜索' },
    { value: 'keyword' as const, label: '关键词搜索' },
  ]

  const hasActiveFilters = startDate || endDate || bookmarkNum > 0

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 h-14 px-6 bg-muted rounded-lg hover:scale-105 active:scale-95 transition-all"
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
        <span className="text-sm font-black text-foreground/60 uppercase tracking-widest">筛选器</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-primary rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10 bg-black bg-opacity-40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed md:absolute bottom-0 md:bottom-auto md:top-full left-0 right-0 md:left-0 md:right-auto md:mt-4 w-full md:w-96 bg-white border-t-8 md:border-t-4 border-primary rounded-t-2xl md:rounded-xl p-8 z-20 max-h-[80vh] overflow-y-auto">
            <div className="md:hidden w-16 h-2 bg-muted rounded-full mx-auto mb-8"></div>
            
            <div className="mb-6">
              <label className="block text-xs font-black text-foreground/40 mb-3 uppercase tracking-widest">
                搜索模式
              </label>
              <select
                value={searchTarget}
                onChange={(e) => onSearchTargetChange(e.target.value as any)}
                className="w-full h-12 px-4 bg-muted border-none rounded-lg font-bold focus:ring-4 focus:ring-primary/20 transition-all text-sm appearance-none"
              >
                {searchTargetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-black text-foreground/40 mb-3 uppercase tracking-widest">
                发布时间范围
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="w-full h-12 px-4 bg-muted border-none rounded-lg font-bold focus:ring-4 focus:ring-primary/20 transition-all text-sm"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="w-full h-12 px-4 bg-muted border-none rounded-lg font-bold focus:ring-4 focus:ring-primary/20 transition-all text-sm"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-black text-foreground/40 mb-3 uppercase tracking-widest">
                最小收藏数
              </label>
              <input
                type="number"
                value={bookmarkNum || ''}
                onChange={(e) => onBookmarkNumChange(Number(e.target.value) || 0)}
                min="0"
                placeholder="0"
                className="w-full h-12 px-4 bg-muted border-none rounded-lg font-bold focus:ring-4 focus:ring-primary/20 transition-all text-sm"
              />
            </div>

            <div className="flex items-center gap-4 pt-4 border-t-2 border-muted">
              <button
                onClick={() => {
                  onSearchTargetChange('partial_match_for_tags')
                  onStartDateChange('')
                  onEndDateChange('')
                  onBookmarkNumChange(0)
                  setIsOpen(false)
                }}
                className="flex-1 h-12 px-6 bg-muted text-foreground/40 font-black rounded-lg hover:text-accent transition-all uppercase tracking-widest text-xs"
              >
                重置
              </button>
              <button
                onClick={() => {
                  onApply()
                  setIsOpen(false)
                }}
                className="flex-[2] h-12 px-6 bg-primary text-white font-black rounded-lg hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
              >
                应用筛选
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
