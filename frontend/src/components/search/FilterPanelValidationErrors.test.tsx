import { describe, expect, it } from 'vitest'
import { renderReactElement } from '../../test/domTestUtils'
import FilterPanelValidationErrors from './FilterPanelValidationErrors'

describe('FilterPanelValidationErrors', () => {
  it('renders translated validation errors', () => {
    const { container, unmount } = renderReactElement(
      <FilterPanelValidationErrors
        errors={['dateRangeInvalid', 'bookmarkRangeInvalid']}
        translateError={(error) => `错误:${error}`}
      />,
    )

    expect(container.textContent).toContain('错误:dateRangeInvalid')
    expect(container.textContent).toContain('错误:bookmarkRangeInvalid')
    expect(container.querySelectorAll('p')).toHaveLength(2)

    unmount()
  })

  it('renders nothing when there are no validation errors', () => {
    const { container, unmount } = renderReactElement(
      <FilterPanelValidationErrors errors={[]} translateError={(error) => error} />,
    )

    expect(container.textContent).toBe('')

    unmount()
  })
})
