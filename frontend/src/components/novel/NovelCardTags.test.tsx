import { describe, expect, it } from 'vitest'
import { renderReactElement } from '../../test/domTestUtils'
import NovelCardTags from './NovelCardTags'

describe('NovelCardTags', () => {
  it('renders the first three tags and an overflow count', () => {
    const { container, unmount } = renderReactElement(
      <NovelCardTags
        tags={['alpha', 'beta', 'gamma', 'delta']}
        renderText={(text) => <strong>{text}</strong>}
      />,
    )

    expect(container.textContent).toContain('#alpha')
    expect(container.textContent).toContain('#beta')
    expect(container.textContent).toContain('#gamma')
    expect(container.textContent).toContain('+1')
    expect(container.textContent).not.toContain('#delta')
    expect(container.querySelectorAll('strong')).toHaveLength(3)

    unmount()
  })

  it('omits the overflow count when all tags are visible', () => {
    const { container, unmount } = renderReactElement(
      <NovelCardTags tags={['alpha', 'beta']} renderText={(text) => text} />,
    )

    expect(container.textContent).toContain('#alpha')
    expect(container.textContent).toContain('#beta')
    expect(container.textContent).not.toContain('+')

    unmount()
  })
})
