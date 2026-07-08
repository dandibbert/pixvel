import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clickButtonContainingText,
  getButtonContainingText,
  renderReactElement,
} from '../../test/domTestUtils'
import { enableReactActEnvironment } from '../../test/reactActEnvironment'

enableReactActEnvironment()

const { EmptyPageState, LoadingPageState } = await import('./PageState')

describe('PageState', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders the shared loading indicator with the provided label', () => {
    const { container, unmount } = renderReactElement(<LoadingPageState label="加载中" />)

    expect(container.textContent).toContain('加载中')
    expect(container.querySelector('.animate-bounce')).toBeInstanceOf(HTMLElement)
    expect(container.querySelector('.animate-spin')).toBeInstanceOf(HTMLElement)

    unmount()
  })

  it('renders empty states with icon variants and optional emphasis', () => {
    const { container, unmount } = renderReactElement(
      <EmptyPageState
        label="暂无内容"
        icon="sparkles"
        iconPulse={true}
        tracking={true}
      />,
    )

    expect(container.textContent).toContain('暂无内容')
    expect(container.querySelector('[data-icon="sparkles"]')).toBeInstanceOf(SVGSVGElement)
    expect(container.querySelector('.animate-pulse')).toBeInstanceOf(HTMLElement)
    expect(container.querySelector('.tracking-widest')).toBeInstanceOf(HTMLElement)

    unmount()
  })

  it('renders and forwards optional empty-state actions', () => {
    const onAction = vi.fn()
    const { container, unmount } = renderReactElement(
      <EmptyPageState
        label="暂无收藏"
        icon="book"
        actionLabel="去发现"
        onAction={onAction}
      />,
    )

    const button = getButtonContainingText(container, '去发现')

    clickButtonContainingText(container, '去发现')

    expect(button.textContent).toContain('去发现')
    expect(onAction).toHaveBeenCalledOnce()

    unmount()
  })
})
