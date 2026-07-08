import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clickElement, getElementBySelector, renderReactElement } from '../test/domTestUtils'
import { enableReactActEnvironment } from '../test/reactActEnvironment'

enableReactActEnvironment()

const { default: HistoryEntryCard } = await import('./HistoryEntryCard')

function renderHistoryEntryCard(props: Partial<React.ComponentProps<typeof HistoryEntryCard>> = {}) {
  const onClick = vi.fn()

  return {
    ...renderReactElement(
      <HistoryEntryCard
        title="测试小说"
        formattedDate="今天"
        showContinue={true}
        continueLabel="继续"
        onClick={onClick}
        {...props}
      />,
    ),
    onClick,
  }
}

describe('HistoryEntryCard', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders history metadata and forwards card clicks', () => {
    const { container, unmount, onClick } = renderHistoryEntryCard()

    expect(container.textContent).toContain('测试小说')
    expect(container.textContent).toContain('今天')
    expect(container.textContent).toContain('继续')

    const card = getElementBySelector(container, '[role="button"]', HTMLElement, 'History card')

    clickElement(card)

    expect(onClick).toHaveBeenCalledOnce()

    unmount()
  })

  it('hides the continue badge when the entry has no saved position', () => {
    const { container, unmount } = renderHistoryEntryCard({ showContinue: false })

    expect(container.textContent).not.toContain('继续')

    unmount()
  })
})
