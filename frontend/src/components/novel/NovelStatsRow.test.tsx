import { describe, expect, it } from 'vitest'
import { renderReactElement } from '../../test/domTestUtils'
import NovelStatsRow from './NovelStatsRow'

describe('NovelStatsRow', () => {
  it('renders preview stats with the page-count badge', () => {
    const { container, unmount } = renderReactElement(
      <NovelStatsRow
        mode="preview"
        textLength={1200}
        totalBookmarks={34}
        totalViews={56}
        pageCount={7}
        formatNumber={(value) => `${value.toLocaleString()}#`}
      />,
    )

    expect(container.textContent).toContain('1,200#')
    expect(container.textContent).toContain('34#')
    expect(container.textContent).toContain('56#')
    expect(container.textContent).toContain('7P')

    unmount()
  })

  it('renders reader stats without the page-count badge', () => {
    const { container, unmount } = renderReactElement(
      <NovelStatsRow
        mode="reader"
        textLength={1200}
        totalBookmarks={34}
        totalViews={56}
        pageCount={7}
        formatNumber={(value) => `${value.toLocaleString()}#`}
      />,
    )

    expect(container.textContent).toContain('1,200#')
    expect(container.textContent).toContain('34#')
    expect(container.textContent).toContain('56#')
    expect(container.textContent).not.toContain('7P')

    unmount()
  })
})
