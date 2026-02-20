import { useEffect, useRef } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { useReaderStore } from '../stores/readerStore'

export function useNovelPagination() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { id: novelId } = useParams<{ id: string }>()
  const { currentPage, totalPages, setPage } = useReaderStore()
  const isUpdatingRef = useRef(false)

  // Clear page parameter when novel ID changes
  useEffect(() => {
    setSearchParams({}, { replace: true })
  }, [novelId, setSearchParams])

  // Sync URL to store only on mount or when URL changes externally
  useEffect(() => {
    if (isUpdatingRef.current) {
      isUpdatingRef.current = false
      return
    }

    const pageParam = searchParams.get('page')
    if (pageParam) {
      const page = parseInt(pageParam, 10)
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        setPage(page)
      }
    }
  }, [searchParams, totalPages, setPage])

  // Reset scroll position after page state is applied to avoid race with URL updates/re-render.
  useEffect(() => {
    if (typeof window === 'undefined') return

    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    scrollToTop()
    const rafId = window.requestAnimationFrame(scrollToTop)

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [currentPage])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      isUpdatingRef.current = true
      setPage(page)
      setSearchParams({ page: page.toString() }, { replace: true })
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1
      isUpdatingRef.current = true
      setPage(newPage)
      setSearchParams({ page: newPage.toString() }, { replace: true })
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      isUpdatingRef.current = true
      setPage(newPage)
      setSearchParams({ page: newPage.toString() }, { replace: true })
    }
  }

  return {
    currentPage,
    totalPages,
    goToPage,
    goToNextPage,
    goToPrevPage,
  }
}
