import { describe, expect, it, vi } from 'vitest'
import { renderReactElement } from '../../test/domTestUtils'
import type { Novel } from '../../types/novel'
import NovelGrid from './NovelGrid'

vi.mock('../../i18n/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('./NovelCard', () => ({
  default: ({ novel }: { novel: Novel }) => <article>{novel.title}</article>,
}))

const novel: Novel = {
  id: 'first',
  title: 'Novel first',
  description: '',
  author: {
    id: 'author-first',
    name: 'Author',
  },
  tags: [],
  pageCount: 1,
  textLength: 1000,
  totalBookmarks: 0,
  totalViews: 0,
  createdAt: '2026-04-26T00:00:00.000Z',
  updatedAt: '2026-04-26T00:00:00.000Z',
}

describe('NovelGrid', () => {
  it('uses a single content-first column on mobile', () => {
    const { container, unmount } = renderReactElement(
      <NovelGrid novels={[novel]} onNovelClick={vi.fn()} />,
    )

    expect(container.firstElementChild?.className).toContain('grid-cols-1')
    expect(container.firstElementChild?.className).toContain('md:grid-cols-2')
    expect(container.firstElementChild?.className).toContain('lg:grid-cols-3')

    unmount()
  })
})
