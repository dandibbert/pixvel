import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clickButtonContainingText,
  clickElement,
  getElementBySelector,
  renderReactElement,
} from '../../test/domTestUtils'
import { enableReactActEnvironment } from '../../test/reactActEnvironment'

enableReactActEnvironment()

const { default: NovelPreviewActionMenu } = await import('./NovelPreviewActionMenu')

function renderNovelPreviewActionMenu() {
  const onClose = vi.fn()
  const onOpenCurrentTab = vi.fn()
  const onOpenNewTab = vi.fn()

  return {
    ...renderReactElement(
      <NovelPreviewActionMenu
        x={120}
        y={140}
        openCurrentTabLabel="当前标签页打开"
        openNewTabLabel="新标签页打开"
        onClose={onClose}
        onOpenCurrentTab={onOpenCurrentTab}
        onOpenNewTab={onOpenNewTab}
      />,
    ),
    onClose,
    onOpenCurrentTab,
    onOpenNewTab,
  }
}

describe('NovelPreviewActionMenu', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('positions the menu and forwards menu actions', () => {
    const { container, unmount, onOpenCurrentTab, onOpenNewTab } = renderNovelPreviewActionMenu()
    const menu = getElementBySelector(
      container,
      '[data-testid="preview-action-menu"]',
      HTMLElement,
      'Preview action menu',
    )

    expect(menu.style.left).toBe('120px')
    expect(menu.style.top).toBe('140px')

    clickButtonContainingText(container, '当前标签页打开')
    clickButtonContainingText(container, '新标签页打开')

    expect(onOpenCurrentTab).toHaveBeenCalledOnce()
    expect(onOpenNewTab).toHaveBeenCalledOnce()

    unmount()
  })

  it('forwards backdrop clicks to close the menu', () => {
    const { container, unmount, onClose } = renderNovelPreviewActionMenu()
    const backdrop = getElementBySelector(
      container,
      '[data-testid="preview-action-menu-backdrop"]',
      HTMLElement,
      'Preview action menu backdrop',
    )

    clickElement(backdrop)

    expect(onClose).toHaveBeenCalledOnce()

    unmount()
  })
})
