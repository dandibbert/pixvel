import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clickButtonContainingText,
  clickElement,
  getButtonContainingText,
  getElementBySelector,
  renderReactElement,
} from '../../test/domTestUtils'
import { enableReactActEnvironment } from '../../test/reactActEnvironment'
import NovelPreviewActions from './NovelPreviewActions'

enableReactActEnvironment()

function renderNovelPreviewActions() {
  const onClose = vi.fn()
  const onOpenCurrentTab = vi.fn()
  const onOpenNewTab = vi.fn()

  const rendered = renderReactElement(
    <NovelPreviewActions
      closeLabel="关闭"
      readNowLabel="立即阅读"
      openCurrentTabLabel="当前标签页打开"
      openNewTabLabel="新标签页打开"
      onClose={onClose}
      onOpenCurrentTab={onOpenCurrentTab}
      onOpenNewTab={onOpenNewTab}
    />,
  )

  return { ...rendered, onClose, onOpenCurrentTab, onOpenNewTab }
}

describe('NovelPreviewActions', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('forwards the close action', () => {
    const { container, onClose, unmount } = renderNovelPreviewActions()

    clickButtonContainingText(container, '关闭')

    expect(onClose).toHaveBeenCalledOnce()

    unmount()
  })

  it('opens in a new tab on a normal read click', () => {
    const { container, onOpenNewTab, unmount } = renderNovelPreviewActions()

    clickButtonContainingText(container, '立即阅读')

    expect(onOpenNewTab).toHaveBeenCalledOnce()

    unmount()
  })

  it('opens the long-press menu and forwards current-tab action', () => {
    vi.useFakeTimers()
    const { container, onOpenCurrentTab, onOpenNewTab, unmount } = renderNovelPreviewActions()
    const readButton = getButtonContainingText(container, '立即阅读')

    act(() => {
      readButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 120, clientY: 140 }))
    })
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(container.textContent).toContain('当前标签页打开')
    expect(container.textContent).toContain('新标签页打开')

    clickButtonContainingText(container, '当前标签页打开')

    expect(onOpenCurrentTab).toHaveBeenCalledOnce()
    expect(onOpenNewTab).not.toHaveBeenCalled()

    unmount()
    vi.useRealTimers()
  })

  it('closes the long-press menu when the backdrop is clicked', () => {
    vi.useFakeTimers()
    const { container, unmount } = renderNovelPreviewActions()
    const readButton = getButtonContainingText(container, '立即阅读')

    act(() => {
      readButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 120, clientY: 140 }))
    })
    act(() => {
      vi.advanceTimersByTime(500)
    })

    const backdrop = getElementBySelector(
      container,
      '[data-testid="preview-action-menu-backdrop"]',
      HTMLElement,
      'Context menu backdrop',
    )

    clickElement(backdrop)

    expect(container.textContent).not.toContain('当前标签页打开')

    unmount()
    vi.useRealTimers()
  })
})
