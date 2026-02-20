interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
}

import { useState } from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState('')

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5 // Reduced for better mobile fit

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        pages.push(currentPage)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault()
    const page = parseInt(jumpValue, 10)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page)
      setJumpValue('')
    }
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-12 w-12 bg-muted text-foreground/40 rounded-lg flex items-center justify-center hover:text-primary transition-all disabled:opacity-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-1.5">
          {getPageNumbers().map((page, index) =>
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={`h-12 min-w-[3rem] px-2 rounded-lg text-sm font-black transition-all ${
                  currentPage === page
                    ? 'bg-primary text-white scale-110'
                    : 'bg-muted text-foreground/40 hover:text-foreground'
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="px-1 text-foreground/20 font-black">
                {page}
              </span>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-12 w-12 bg-muted text-foreground/40 rounded-lg flex items-center justify-center hover:text-primary transition-all disabled:opacity-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleJump} className="flex items-center bg-muted p-1 rounded-xl">
        <input
          type="number"
          min="1"
          max={totalPages}
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          placeholder={currentPage.toString()}
          className="w-16 h-10 bg-transparent border-none text-center font-black text-sm focus:ring-0 placeholder:text-foreground/30"
        />
        <div className="w-[2px] h-4 bg-foreground/10 mx-1"></div>
        <span className="px-3 text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">/ {totalPages}</span>
        <button
          type="submit"
          className="h-10 px-4 bg-primary text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
        >
          跳转
        </button>
      </form>
    </div>
  )
}
