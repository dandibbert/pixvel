import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderReactElement } from '../test/domTestUtils'
import { READING_PROGRESS_SAVE_DELAY_MS, useReadingProgress } from './useReadingProgress'
import { READING_PROGRESS_STORAGE_KEY, readReadingProgressOffset } from '../utils/readingProgress'

class FakeViewport extends EventTarget {
  scrollY = 0
  scrolls: number[] = []
  private frames: FrameRequestCallback[] = []

  scrollTo(options: ScrollToOptions) {
    const top = options.top ?? 0
    this.scrollY = top
    this.scrolls.push(top)
  }

  requestAnimationFrame(callback: FrameRequestCallback) {
    this.frames.push(callback)
    return this.frames.length
  }

  cancelAnimationFrame() {
    this.frames = []
  }

  runPendingFrames() {
    const pending = this.frames.splice(0, this.frames.length)
    pending.forEach((callback) => callback(16))
  }

  scroll(offset: number) {
    this.scrollY = offset
    this.dispatchEvent(new Event('scroll'))
  }
}

function createMemoryStorage(initial: Record<string, string> = {}): Storage {
  const entries = new Map(Object.entries(initial))

  return {
    get length() {
      return entries.size
    },
    clear: () => entries.clear(),
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => Array.from(entries.keys())[index] ?? null,
    removeItem: (key: string) => {
      entries.delete(key)
    },
    setItem: (key: string, value: string) => {
      entries.set(key, value)
    },
  }
}

function storedProgress(novelId: string, page: number, offset: number) {
  return {
    [READING_PROGRESS_STORAGE_KEY]: JSON.stringify({
      [novelId]: { page, offset, updatedAt: 1 },
    }),
  }
}

interface ProgressProbeProps {
  novelId: string | undefined
  currentPage: number
  isReady: boolean
  storage: Storage
  viewport: FakeViewport
  maxOffset?: number
}

function ProgressProbe({
  novelId,
  currentPage,
  isReady,
  storage,
  viewport,
  maxOffset = 5000,
}: ProgressProbeProps) {
  useReadingProgress({
    novelId,
    currentPage,
    isReady,
    storage,
    viewport,
    visibilityTarget: null,
    getMaxOffset: () => maxOffset,
  })

  return null
}

describe('useReadingProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns to the saved offset when a novel is reopened on the same page', () => {
    const viewport = new FakeViewport()
    const storage = createMemoryStorage(storedProgress('novel-1', 2, 640))

    const { unmount } = renderReactElement(
      <ProgressProbe novelId="novel-1" currentPage={2} isReady storage={storage} viewport={viewport} />,
    )

    expect(viewport.scrolls).toEqual([640])

    unmount()
  })

  it('starts at the top when the saved offset belongs to another page', () => {
    const viewport = new FakeViewport()
    const storage = createMemoryStorage(storedProgress('novel-1', 5, 640))

    const { unmount } = renderReactElement(
      <ProgressProbe novelId="novel-1" currentPage={2} isReady storage={storage} viewport={viewport} />,
    )

    expect(viewport.scrolls).toEqual([0])

    unmount()
  })

  it('waits for the content to load before restoring', () => {
    const viewport = new FakeViewport()
    const storage = createMemoryStorage(storedProgress('novel-1', 1, 320))

    const { root, unmount } = renderReactElement(
      <ProgressProbe
        novelId="novel-1"
        currentPage={1}
        isReady={false}
        storage={storage}
        viewport={viewport}
      />,
    )

    expect(viewport.scrolls).toEqual([])

    act(() => {
      root.render(
        <ProgressProbe novelId="novel-1" currentPage={1} isReady storage={storage} viewport={viewport} />,
      )
    })

    expect(viewport.scrolls).toEqual([320])

    unmount()
  })

  it('resets to the top on later page turns instead of restoring again', () => {
    const viewport = new FakeViewport()
    const storage = createMemoryStorage(storedProgress('novel-1', 1, 320))

    const { root, unmount } = renderReactElement(
      <ProgressProbe novelId="novel-1" currentPage={1} isReady storage={storage} viewport={viewport} />,
    )

    expect(viewport.scrolls).toEqual([320])

    act(() => {
      root.render(
        <ProgressProbe novelId="novel-1" currentPage={2} isReady storage={storage} viewport={viewport} />,
      )
    })

    expect(viewport.scrolls).toEqual([320, 0])

    unmount()
  })

  it('saves the scroll offset of the page being read', () => {
    const viewport = new FakeViewport()
    const storage = createMemoryStorage()

    const { unmount } = renderReactElement(
      <ProgressProbe novelId="novel-1" currentPage={3} isReady storage={storage} viewport={viewport} />,
    )

    act(() => {
      viewport.scroll(740)
      vi.advanceTimersByTime(READING_PROGRESS_SAVE_DELAY_MS)
    })

    expect(readReadingProgressOffset(storage, { novelId: 'novel-1', page: 3 })).toBe(740)

    unmount()
  })

  it('collapses a burst of scrolling into a single stored position', () => {
    const viewport = new FakeViewport()
    const storage = createMemoryStorage()
    const setItem = vi.spyOn(storage, 'setItem')

    const { unmount } = renderReactElement(
      <ProgressProbe novelId="novel-1" currentPage={1} isReady storage={storage} viewport={viewport} />,
    )

    act(() => {
      viewport.scroll(100)
      viewport.scroll(200)
      viewport.scroll(300)
      vi.advanceTimersByTime(READING_PROGRESS_SAVE_DELAY_MS)
    })

    expect(setItem).toHaveBeenCalledTimes(1)
    expect(readReadingProgressOffset(storage, { novelId: 'novel-1', page: 1 })).toBe(300)

    unmount()
  })

  it('writes the pending position when the page is hidden before the delay elapses', () => {
    const viewport = new FakeViewport()
    const storage = createMemoryStorage()

    const { unmount } = renderReactElement(
      <ProgressProbe novelId="novel-1" currentPage={1} isReady storage={storage} viewport={viewport} />,
    )

    act(() => {
      viewport.scroll(880)
      viewport.dispatchEvent(new Event('pagehide'))
    })

    expect(readReadingProgressOffset(storage, { novelId: 'novel-1', page: 1 })).toBe(880)

    unmount()
  })

  it('writes the pending position when the reader unmounts', () => {
    const viewport = new FakeViewport()
    const storage = createMemoryStorage()

    const { unmount } = renderReactElement(
      <ProgressProbe novelId="novel-1" currentPage={1} isReady storage={storage} viewport={viewport} />,
    )

    act(() => {
      viewport.scroll(410)
    })

    unmount()

    expect(readReadingProgressOffset(storage, { novelId: 'novel-1', page: 1 })).toBe(410)
  })

  it('ignores scrolling before the novel is ready', () => {
    const viewport = new FakeViewport()
    const storage = createMemoryStorage()

    const { unmount } = renderReactElement(
      <ProgressProbe
        novelId="novel-1"
        currentPage={1}
        isReady={false}
        storage={storage}
        viewport={viewport}
      />,
    )

    act(() => {
      viewport.scroll(500)
      vi.advanceTimersByTime(READING_PROGRESS_SAVE_DELAY_MS)
    })

    expect(storage.getItem(READING_PROGRESS_STORAGE_KEY)).toBeNull()

    unmount()
  })
})
