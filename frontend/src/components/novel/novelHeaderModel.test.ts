import { describe, expect, it } from 'vitest'
import {
  buildNovelHeaderViewModel,
  buildNovelHeaderScrollState,
  shouldShowNovelHeader,
} from './novelHeaderModel'

describe('novelHeaderModel', () => {
  it('hides the header only while scrolling down past the threshold', () => {
    expect(shouldShowNovelHeader({ scrollY: 101, lastScrollY: 100 })).toBe(false)
    expect(shouldShowNovelHeader({ scrollY: 100, lastScrollY: 99 })).toBe(true)
    expect(shouldShowNovelHeader({ scrollY: 80, lastScrollY: 120 })).toBe(true)
  })

  it('builds the next scroll state from the current scroll position', () => {
    expect(buildNovelHeaderScrollState({
      scrollY: 120,
      lastScrollY: 80,
    })).toEqual({
      isVisible: false,
      lastScrollY: 120,
    })

    expect(buildNovelHeaderScrollState({
      scrollY: 90,
      lastScrollY: 120,
    })).toEqual({
      isVisible: true,
      lastScrollY: 90,
    })
  })

  it('builds paths and visibility classes for the header', () => {
    expect(buildNovelHeaderViewModel({
      authorId: 'author-1',
      isVisible: true,
      canDownload: true,
      downloadTitle: 'Download novel',
      hasRefreshAction: true,
      hasDownloadAction: true,
    })).toEqual({
      authorPath: '/author/author-1',
      visibilityClassName: 'translate-y-0',
      showRefreshAction: true,
      showDownloadAction: true,
      isDownloadDisabled: false,
      downloadTitle: 'Download novel',
    })

    expect(buildNovelHeaderViewModel({
      authorId: 'author-2',
      isVisible: false,
      canDownload: false,
      hasRefreshAction: false,
      hasDownloadAction: false,
    })).toEqual({
      authorPath: '/author/author-2',
      visibilityClassName: '-translate-y-full',
      showRefreshAction: false,
      showDownloadAction: false,
      isDownloadDisabled: true,
      downloadTitle: undefined,
    })
  })
})
