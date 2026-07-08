import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { clickElement, getAnchorByHref, getElementBySelector, renderReactElement } from '../../test/domTestUtils'
import { enableReactActEnvironment } from '../../test/reactActEnvironment'

enableReactActEnvironment()

const { default: NovelPageNavAction } = await import('./NovelPageNavAction')

function renderNovelPageNavAction(element: React.ReactElement) {
  return renderReactElement(element, {
    wrapper: (children) => <MemoryRouter>{children}</MemoryRouter>,
  })
}

describe('NovelPageNavAction', () => {
  it('renders series jumps as router links with the series visual treatment', () => {
    const { container, unmount } = renderNovelPageNavAction(
      <NovelPageNavAction
        type="series"
        to="/novel/previous"
        title="Previous series: Title"
        ariaLabel="Previous series: Title"
      >
        <span>SER</span>
      </NovelPageNavAction>,
    )

    const link = getAnchorByHref(container, '/novel/previous')

    expect(link.getAttribute('title')).toBe('Previous series: Title')
    expect(link.getAttribute('aria-label')).toBe('Previous series: Title')
    expect(link.className).toContain('min-w-[48px]')
    expect(link.className).toContain('bg-primary/10')
    expect(link.textContent).toContain('SER')

    unmount()
  })

  it('renders disabled page jumps as disabled buttons with muted styling', () => {
    const onClick = vi.fn()
    const { container, unmount } = renderNovelPageNavAction(
      <NovelPageNavAction
        type="page"
        disabled
        title="Previous page"
        ariaLabel="Previous page"
        onClick={onClick}
      >
        <span>PAGE</span>
      </NovelPageNavAction>,
    )

    const button = getElementBySelector(container, 'button', HTMLButtonElement, 'Page action button')

    expect(button.disabled).toBe(true)
    expect(button.getAttribute('title')).toBe('Previous page')
    expect(button.getAttribute('aria-label')).toBe('Previous page')
    expect(button.className).toContain('w-12')
    expect(button.className).toContain('cursor-not-allowed')

    clickElement(button)
    expect(onClick).not.toHaveBeenCalled()

    unmount()
  })
})
