import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { renderReactElement } from '../../test/domTestUtils'
import type { Novel } from '../../types/novel'
import NovelCard from './NovelCard'

vi.mock('../../i18n/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    formatNumber: (value: number) => String(value),
  }),
}))

const novel: Novel = {
  id: 'first',
  title: '雨夜列车尽头',
  description: '移动端隐藏的作品简介',
  author: {
    id: 'author-first',
    name: '青木遥',
  },
  tags: ['恋爱', '现代'],
  pageCount: 1,
  textLength: 1000,
  totalBookmarks: 20,
  totalViews: 30,
  createdAt: '2026-04-26T00:00:00.000Z',
  updatedAt: '2026-04-26T00:00:00.000Z',
}

describe('NovelCard', () => {
  it('keeps the synopsis visible on mobile', () => {
    const { container, unmount } = renderReactElement(
      <MemoryRouter>
        <NovelCard novel={novel} onClick={vi.fn()} />
      </MemoryRouter>,
    )
    const content = container.querySelector('[data-testid="novel-card-content"]')
    const description = container.querySelector('[data-testid="novel-card-description"]')

    expect(content?.className).toContain('gap-1.5')
    expect(content?.className).toContain('md:gap-3')
    expect(description?.className.split(/\s+/)).not.toContain('hidden')
    expect(description?.className).toContain('line-clamp-2')
    expect(description?.textContent).toContain('移动端隐藏的作品简介')

    unmount()
  })

  it('does not force mobile cards or their content to full height', () => {
    const { container, unmount } = renderReactElement(
      <MemoryRouter>
        <NovelCard novel={novel} onClick={vi.fn()} />
      </MemoryRouter>,
    )
    const card = container.firstElementChild
    const content = container.querySelector('[data-testid="novel-card-content"]')

    expect(card?.className.split(/\s+/)).not.toContain('h-full')
    expect(card?.className.split(/\s+/)).toContain('md:h-full')
    expect(content?.className.split(/\s+/)).not.toContain('h-full')
    expect(content?.className.split(/\s+/)).toContain('md:h-full')

    unmount()
  })

  it('does not reserve an empty series row for standalone novels', () => {
    const { container, unmount } = renderReactElement(
      <MemoryRouter>
        <NovelCard novel={novel} onClick={vi.fn()} />
      </MemoryRouter>,
    )

    expect(container.querySelector('.h-\\[20px\\]')).toBeNull()

    unmount()
  })
})
