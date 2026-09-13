import { useCallback, useEffect, useRef } from 'react'
import { useEventListener } from './useEventListener'
import { restoreViewportOffset, scrollViewportToTopAfterNextFrame } from '../utils/pageScroll'
import { readReadingProgressOffset, writeReadingProgress } from '../utils/readingProgress'

/**
 * Scroll offsets are written while scrolling, so they are batched; the delay is
 * short because an unexpected tab kill (Safari under memory pressure) loses
 * whatever has not been written yet.
 */
export const READING_PROGRESS_SAVE_DELAY_MS = 400

const PASSIVE_LISTENER: AddEventListenerOptions = { passive: true }

export interface ReadingProgressViewport {
  readonly scrollY: number
  scrollTo: (options: ScrollToOptions) => void
  requestAnimationFrame: (callback: FrameRequestCallback) => number
  cancelAnimationFrame: (handle: number) => void
  addEventListener: EventTarget['addEventListener']
  removeEventListener: EventTarget['removeEventListener']
}

interface UseReadingProgressOptions {
  novelId: string | undefined
  currentPage: number
  isReady: boolean
  storage?: Storage | null
  viewport?: ReadingProgressViewport | null
  visibilityTarget?: Pick<Document, 'addEventListener' | 'removeEventListener' | 'visibilityState'> | null
  getMaxOffset?: () => number
  saveDelayMs?: number
}

/**
 * Remembers where the reader was left off and returns there after a reload.
 *
 * This hook owns the reader's scroll position: it restores the saved offset the
 * first time a novel is shown and resets to the top on later page turns, so the
 * two behaviours cannot race each other.
 */
export function useReadingProgress({
  novelId,
  currentPage,
  isReady,
  storage = resolveDefaultStorage(),
  viewport = resolveDefaultViewport(),
  visibilityTarget = resolveDefaultVisibilityTarget(),
  getMaxOffset,
  saveDelayMs = READING_PROGRESS_SAVE_DELAY_MS,
}: UseReadingProgressOptions) {
  const restoredNovelIdRef = useRef<string | null>(null)
  const pendingRef = useRef<{ novelId: string; page: number; offset: number } | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flushProgress = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    const pending = pendingRef.current
    if (!pending) return

    pendingRef.current = null
    writeReadingProgress(storage, { ...pending, updatedAt: Date.now() })
  }, [storage])

  const recordProgress = useCallback(() => {
    if (!novelId || !isReady || !viewport) return

    pendingRef.current = { novelId, page: currentPage, offset: viewport.scrollY }

    if (timerRef.current === null) {
      timerRef.current = setTimeout(flushProgress, saveDelayMs)
    }
  }, [novelId, currentPage, isReady, viewport, flushProgress, saveDelayMs])

  useEventListener(viewport, 'scroll', recordProgress, PASSIVE_LISTENER)

  // pagehide covers iOS Safari, which does not reliably fire unload; the
  // visibility change catches tabs that are backgrounded and then killed.
  useEventListener(viewport, 'pagehide', flushProgress)
  useEventListener(visibilityTarget, 'visibilitychange', () => {
    if (visibilityTarget?.visibilityState === 'hidden') {
      flushProgress()
    }
  })

  useEffect(() => flushProgress, [flushProgress])

  useEffect(() => {
    if (!isReady || !novelId || !viewport) return undefined

    const isFirstViewOfNovel = restoredNovelIdRef.current !== novelId
    restoredNovelIdRef.current = novelId

    if (isFirstViewOfNovel) {
      const savedOffset = readReadingProgressOffset(storage, { novelId, page: currentPage })

      if (savedOffset !== null) {
        return restoreViewportOffset({ offset: savedOffset, target: viewport, getMaxOffset })
      }
    }

    return scrollViewportToTopAfterNextFrame({ target: viewport, behavior: 'auto' })
  }, [novelId, currentPage, isReady, viewport, storage, getMaxOffset])
}

function resolveDefaultStorage(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    // Safari throws when site data is blocked; reading then falls back to the
    // top of the page instead of breaking the reader.
    return null
  }
}

function resolveDefaultViewport(): ReadingProgressViewport | null {
  return typeof window === 'undefined' ? null : window
}

function resolveDefaultVisibilityTarget(): Document | null {
  return typeof document === 'undefined' ? null : document
}
