import { describe, expect, it } from 'vitest'
import { getElementsBySelector, renderReactElement } from '../../test/domTestUtils'
import HighlightedText from './HighlightedText'

describe('HighlightedText', () => {
  it('renders plain text without highlight wrappers when no words match', () => {
    const { container, unmount } = renderReactElement(
      <HighlightedText text="Plain title" highlightWords={['missing']} className="highlight" />,
    )

    expect(container.textContent).toBe('Plain title')
    expect(container.querySelector('.highlight')).toBeNull()

    unmount()
  })

  it('wraps matching segments with the provided highlight class', () => {
    const { container, unmount } = renderReactElement(
      <HighlightedText text="Alpha beta ALPHA" highlightWords={['alpha']} className="highlight" />,
    )

    const highlighted = getElementsBySelector(container, '.highlight', HTMLElement, 'Highlighted text segments')
    expect(container.textContent).toBe('Alpha beta ALPHA')
    expect(highlighted.map((element) => element.textContent)).toEqual(['Alpha', 'ALPHA'])

    unmount()
  })
})
