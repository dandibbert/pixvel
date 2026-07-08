import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { getElementBySelector, renderReactElement } from '../test/domTestUtils'
import { enableReactActEnvironment } from '../test/reactActEnvironment'
import { useURLState } from './useURLState'

enableReactActEnvironment()

interface ProbeState {
  page: number
  enabled: boolean
  query: string
}

function URLStateProbe({ defaults }: { defaults: ProbeState }) {
  const [state] = useURLState(defaults)

  return (
    <output
      data-page={String(state.page)}
      data-enabled={String(state.enabled)}
      data-query={state.query}
    />
  )
}

function renderProbe(path: string, defaults: ProbeState) {
  return renderReactElement(<URLStateProbe defaults={defaults} />, {
    wrapper: (children) => <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>,
  })
}

function getOutput(container: HTMLElement): HTMLOutputElement {
  return getElementBySelector(container, 'output', HTMLOutputElement, 'URL state output')
}

describe('useURLState', () => {
  it('parses URL values based on default value types', () => {
    const { container, unmount } = renderProbe('/search?page=3&enabled=true&query=五悠', {
      page: 1,
      enabled: false,
      query: '',
    })

    const output = getOutput(container)

    expect(output.dataset.page).toBe('3')
    expect(output.dataset.enabled).toBe('true')
    expect(output.dataset.query).toBe('五悠')

    unmount()
  })

  it('falls back to numeric defaults for malformed numbers', () => {
    const { container, unmount } = renderProbe('/bookmarks?page=abc', {
      page: 1,
      enabled: false,
      query: '',
    })

    expect(getOutput(container).dataset.page).toBe('1')

    unmount()
  })

  it('falls back to boolean defaults for unsupported boolean strings', () => {
    const { container, unmount } = renderProbe('/search?enabled=maybe', {
      page: 1,
      enabled: true,
      query: '',
    })

    expect(getOutput(container).dataset.enabled).toBe('true')

    unmount()
  })
})
