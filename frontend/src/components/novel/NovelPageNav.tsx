import { useState } from 'react'

interface NovelPageNavProps {
  currentPage: number
  totalPages: number
  onPrevPage: () => void
  onNextPage: () => void
  onGoToPage: (page: number) => void
}

export default function NovelPageNav({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onGoToPage,
}: NovelPageNavProps) {
  const [pageInput, setPageInput] = useState('')

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const page = parseInt(pageInput, 10)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onGoToPage(page)
      setPageInput('')
    }
  }

  return (
    <div className="sticky bottom-0 bg-white border-t-2 border-muted px-4 py-2 md:py-3 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="h-10 w-10 md:h-12 md:w-12 bg-muted text-foreground/40 font-black rounded-lg flex items-center justify-center hover:text-primary transition-all disabled:opacity-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-center">
          <form onSubmit={handlePageSubmit} className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              placeholder={currentPage.toString()}
              className="w-12 h-10 md:h-12 bg-muted border-none rounded-lg font-black text-center text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-foreground"
            />
            <span className="text-[10px] md:text-xs font-black text-foreground/20 uppercase tracking-widest">/ {totalPages}</span>
          </form>
        </div>

        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="h-10 w-10 md:h-12 md:w-12 bg-muted text-foreground/40 font-black rounded-lg flex items-center justify-center hover:text-primary transition-all disabled:opacity-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
