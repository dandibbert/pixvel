import { describe, expect, it, vi } from 'vitest'
import { clickButtonContainingText, renderReactElement } from '../../test/domTestUtils'
import NovelDetailAuthorBlock from './NovelDetailAuthorBlock'

const author = {
  id: 'author-1',
  name: 'Author Name',
}

function renderText(text: string) {
  return <span>{text}</span>
}

describe('NovelDetailAuthorBlock', () => {
  it('renders static author metadata when navigation is not available', () => {
    const { container, unmount } = renderReactElement(
      <NovelDetailAuthorBlock
        author={author}
        createdAt="2024-01-02T00:00:00.000Z"
        locale="zh"
        renderText={renderText}
      />,
    )

    expect(container.textContent).toContain('A')
    expect(container.textContent).toContain('Author Name')
    expect(container.textContent).toContain('2024/1/2')
    expect(container.querySelectorAll('button')).toHaveLength(0)

    unmount()
  })

  it('forwards author navigation from both avatar and name actions', () => {
    const onNavigateAuthor = vi.fn()
    const { container, unmount } = renderReactElement(
      <NovelDetailAuthorBlock
        author={author}
        createdAt="2024-01-02T00:00:00.000Z"
        locale="ja"
        renderText={renderText}
        onNavigateAuthor={onNavigateAuthor}
      />,
    )

    clickButtonContainingText(container, 'A')
    clickButtonContainingText(container, 'Author Name')

    expect(onNavigateAuthor).toHaveBeenCalledTimes(2)
    expect(onNavigateAuthor).toHaveBeenNthCalledWith(1, 'author-1')
    expect(onNavigateAuthor).toHaveBeenNthCalledWith(2, 'author-1')

    unmount()
  })
})
