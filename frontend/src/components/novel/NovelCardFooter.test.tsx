import { describe, expect, it } from 'vitest'
import { renderReactElement } from '../../test/domTestUtils'
import NovelCardFooter from './NovelCardFooter'

describe('NovelCardFooter', () => {
  it('renders formatted bookmark, word count, and page count stats', () => {
    const { container, unmount } = renderReactElement(
      <NovelCardFooter
        totalBookmarks={1234}
        textLength={5678}
        pageCount={9}
        bookmarksTitle="Bookmarks"
        wordCountTitle="Words"
        formatNumber={(value) => `${value.toLocaleString()}#`}
      />,
    )

    expect(container.textContent).toContain('1,234#')
    expect(container.textContent).toContain('5,678#')
    expect(container.textContent).toContain('9P')
    expect(container.querySelector('[title="Bookmarks"]')?.textContent).toContain('1,234#')
    expect(container.querySelector('[title="Words"]')?.textContent).toContain('5,678#')

    unmount()
  })
})
