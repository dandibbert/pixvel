import { describe, expect, it } from 'vitest'
import { renderReactElement } from '../test/domTestUtils'
import SearchPageHero from './SearchPageHero'

describe('SearchPageHero', () => {
  it('renders the search page title and subtitle', () => {
    const { container, unmount } = renderReactElement(
      <SearchPageHero title="搜索小说" subtitle="查找 Pixiv 小说" />,
    )

    expect(container.querySelector('h1')?.textContent).toBe('搜索小说')
    expect(container.textContent).toContain('查找 Pixiv 小说')
    expect(container.firstElementChild?.className).toContain('bg-primary')

    unmount()
  })
})
