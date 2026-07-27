import { useEffect, useRef } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { useReaderStore } from '../stores/readerStore'
import { scrollViewportToTopAfterNextFrame } from '../utils/pageScroll'
import {
  buildReaderPageSearchParams,
  resolveNextReaderPage,
  resolvePreviousReaderPage,
  resolveReaderPageFromSearchParams,
  resolveRequestedReaderPage,
} from './novelPaginationModel'

export function useNovelPagination() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { id: novelId } = useParams<{ id: string }>()
  const currentPage = useReaderStore((state) => state.currentPage)
  const totalPages = useReaderStore((state) => state.totalPages)
  const setPage = useReaderStore((state) => state.setPage)
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

    const page = resolveReaderPageFromSearchParams(searchParams, totalPages)
    if (page !== null) {
      setPage(page)
    }
  }, [searchParams, totalPages, setPage])

  // Reset scroll position after page state is applied to avoid race with URL updates/re-render.
  useEffect(() => {
    return scrollViewportToTopAfterNextFrame({ behavior: 'auto' })
  }, [currentPage])

  const applyPageNavigation = (page: number) => {
    isUpdatingRef.current = true
    setPage(page)
    setSearchParams(buildReaderPageSearchParams(page), { replace: true })
  }

  const goToPage = (page: number) => {
    const nextPage = resolveRequestedReaderPage(page, totalPages)
    if (nextPage !== null) {
      applyPageNavigation(nextPage)
    }
  }

  const goToNextPage = () => {
    const nextPage = resolveNextReaderPage(currentPage, totalPages)
    if (nextPage !== null) {
      applyPageNavigation(nextPage)
    }
  }

  const goToPrevPage = () => {
    const nextPage = resolvePreviousReaderPage(currentPage)
    if (nextPage !== null) {
      applyPageNavigation(nextPage)
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
