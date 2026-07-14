import { describe, expect, it, vi } from 'vitest'
import { renderReactElement } from '../../test/domTestUtils'
import SearchBar from './SearchBar'

vi.mock('../../i18n/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key === 'search.submit' ? '搜索' : '搜索小说',
  }),
}))

describe('SearchBar', () => {
  it('uses compact mobile dimensions and restores the larger desktop size', () => {
    const { container, unmount } = renderReactElement(
      <SearchBar value="星尘" onChange={vi.fn()} onSearch={vi.fn()} />,
    )
    const input = container.querySelector('input')
    const button = container.querySelector('button[type="submit"]')

    expect(input?.className).toContain('h-14')
    expect(input?.className).toContain('md:h-16')
    expect(button?.className).toContain('h-11')
    expect(button?.className).toContain('md:h-12')

    unmount()
  })
})
