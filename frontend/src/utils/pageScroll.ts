interface ScrollViewportTarget {
  scrollTo: (options: ScrollToOptions) => void
}

interface AnimationFrameTarget extends ScrollViewportTarget {
  requestAnimationFrame: (callback: FrameRequestCallback) => number
  cancelAnimationFrame: (handle: number) => void
}

interface ScrollViewportToTopOptions {
  target?: ScrollViewportTarget
  behavior?: ScrollBehavior
}

interface ScrollViewportToTopAfterNextFrameOptions {
  target?: AnimationFrameTarget
  behavior?: ScrollBehavior
}

export function scrollViewportToTop({
  target,
  behavior = 'smooth',
}: ScrollViewportToTopOptions = {}) {
  const scrollTarget = target ?? (typeof window === 'undefined' ? null : window)

  if (!scrollTarget) return

  scrollTarget.scrollTo({
    top: 0,
    left: 0,
    behavior,
  })
}

interface RestoreViewportOffsetOptions {
  offset: number
  target?: AnimationFrameTarget
  getMaxOffset?: () => number
  maxAttempts?: number
}

const DEFAULT_RESTORE_ATTEMPTS = 30

export function scrollViewportToOffset({
  offset,
  target,
  behavior = 'auto',
}: {
  offset: number
  target?: ScrollViewportTarget
  behavior?: ScrollBehavior
}) {
  const scrollTarget = target ?? (typeof window === 'undefined' ? null : window)

  if (!scrollTarget) return

  scrollTarget.scrollTo({
    top: Math.max(0, offset),
    left: 0,
    behavior,
  })
}

/**
 * Restores a saved scroll offset once the document is actually tall enough to
 * reach it. Reader content grows across frames (async content, web fonts), so
 * scrolling immediately would land short; each frame re-checks, and the last
 * attempt scrolls as far as the document allows.
 */
export function restoreViewportOffset({
  offset,
  target,
  getMaxOffset,
  maxAttempts = DEFAULT_RESTORE_ATTEMPTS,
}: RestoreViewportOffsetOptions) {
  const scrollTarget = target ?? (typeof window === 'undefined' ? null : window)

  if (!scrollTarget || offset <= 0) return undefined

  const readMaxOffset = getMaxOffset ?? defaultMaxOffset
  let frameId: number | null = null
  let attemptsLeft = maxAttempts
  let isCancelled = false

  const attempt = () => {
    frameId = null
    if (isCancelled) return

    const maxOffset = readMaxOffset()

    if (maxOffset >= offset || attemptsLeft <= 0) {
      scrollViewportToOffset({
        offset: Math.min(offset, Math.max(0, maxOffset)),
        target: scrollTarget,
      })
      return
    }

    attemptsLeft -= 1
    frameId = scrollTarget.requestAnimationFrame(attempt)
  }

  attempt()

  return () => {
    isCancelled = true
    if (frameId !== null) {
      scrollTarget.cancelAnimationFrame(frameId)
      frameId = null
    }
  }
}

export function scrollViewportToTopAfterNextFrame({
  target,
  behavior = 'smooth',
}: ScrollViewportToTopAfterNextFrameOptions = {}) {
  const scrollTarget = target ?? (typeof window === 'undefined' ? null : window)

  if (!scrollTarget) return undefined

  const scrollToTop = () => scrollViewportToTop({ target: scrollTarget, behavior })

  scrollToTop()
  const frameId = scrollTarget.requestAnimationFrame(scrollToTop)

  return () => scrollTarget.cancelAnimationFrame(frameId)
}

function defaultMaxOffset(): number {
  if (typeof document === 'undefined' || typeof window === 'undefined') return 0

  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
}
