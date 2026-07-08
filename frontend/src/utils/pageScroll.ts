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
