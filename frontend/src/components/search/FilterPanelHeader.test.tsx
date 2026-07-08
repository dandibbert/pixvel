import { describe, expect, it, vi } from 'vitest'
import { clickButtonByLabel, renderReactElement } from '../../test/domTestUtils'
import FilterPanelHeader from './FilterPanelHeader'

describe('FilterPanelHeader', () => {
  it('renders title, API subtitle, and forwards close clicks', () => {
    const onClose = vi.fn()
    const rendered = renderReactElement(
      <FilterPanelHeader title="筛选器" closeLabel="关闭筛选器" onClose={onClose} />,
    )
    const { container } = rendered

    expect(container.textContent).toContain('筛选器')
    expect(container.textContent).toContain('Pixiv App API')

    clickButtonByLabel(container, '关闭筛选器')

    expect(onClose).toHaveBeenCalledTimes(1)

    rendered.unmount()
  })
})
