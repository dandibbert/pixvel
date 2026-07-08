import { describe, expect, it } from 'vitest'
import {
  changeInputValue,
  changeSelectValue,
  clickButtonByText,
  clickButtonContainingText,
  clickButtonByLabel,
  clickCheckboxByLabel,
  clickElement,
  getElementBySelector,
  getElementsBySelector,
  getAnchorByHref,
  getTextByTestId,
  getButtonByLabel,
  getButtonByText,
  getButtonContainingText,
  getCheckboxByLabel,
  renderReactElement,
} from './domTestUtils'

describe('domTestUtils', () => {
  it('renders React elements into document containers and unmounts them', () => {
    const rendered = renderReactElement(<button type="button">Save</button>)

    expect(document.body.contains(rendered.container)).toBe(true)
    expect(getButtonByText(rendered.container, 'Save').type).toBe('button')

    rendered.unmount()

    expect(document.body.contains(rendered.container)).toBe(false)
  })

  it('renders elements through an optional wrapper', () => {
    const rendered = renderReactElement(<button type="button">Wrapped</button>, {
      wrapper: (children) => <section data-testid="wrapper">{children}</section>,
    })

    expect(rendered.container.querySelector('[data-testid="wrapper"]')).toBeInstanceOf(HTMLElement)
    expect(getButtonByText(rendered.container, 'Wrapped')).toBeInstanceOf(HTMLButtonElement)

    rendered.unmount()
  })

  it('finds buttons by exact text or contained text with readable failures', () => {
    const rendered = renderReactElement(
      <div>
        <button type="button">Open current tab</button>
        <button type="button">Open new tab</button>
      </div>,
    )

    expect(getButtonByText(rendered.container, 'Open new tab').textContent).toBe('Open new tab')
    expect(getButtonContainingText(rendered.container, 'current').textContent).toBe('Open current tab')
    expect(() => getButtonByText(rendered.container, 'Missing')).toThrow('Button "Missing" was not found')

    rendered.unmount()
  })

  it('clicks buttons by exact text or contained text inside React act', () => {
    let exactClicks = 0
    let containingClicks = 0
    const rendered = renderReactElement(
      <div>
        <button type="button" onClick={() => exactClicks += 1}>
          Save
        </button>
        <button type="button" onClick={() => containingClicks += 1}>
          Open current tab
        </button>
      </div>,
    )

    clickButtonByText(rendered.container, 'Save')
    clickButtonContainingText(rendered.container, 'current')

    expect(exactClicks).toBe(1)
    expect(containingClicks).toBe(1)

    rendered.unmount()
  })

  it('finds and clicks buttons by aria-label with readable failures', () => {
    let clicks = 0
    const rendered = renderReactElement(
      <button type="button" aria-label="Remove item" onClick={() => clicks += 1}>
        ×
      </button>,
    )

    expect(getButtonByLabel(rendered.container, 'Remove item').textContent).toBe('×')

    clickButtonByLabel(rendered.container, 'Remove item')

    expect(clicks).toBe(1)
    expect(() => getButtonByLabel(rendered.container, 'Missing action')).toThrow(
      'Button with label "Missing action" was not found',
    )

    rendered.unmount()
  })

  it('finds aria-label buttons whose labels contain quotes', () => {
    const rendered = renderReactElement(
      <button type="button" aria-label='Remove "quoted" item'>
        remove
      </button>,
    )

    expect(getButtonByLabel(rendered.container, 'Remove "quoted" item').textContent).toBe('remove')

    rendered.unmount()
  })

  it('clicks arbitrary HTMLElements inside React act', () => {
    let clicks = 0
    const rendered = renderReactElement(
      <div role="button" tabIndex={0} onClick={() => clicks += 1}>
        Open
      </div>,
    )
    const element = getElementBySelector(rendered.container, '[role="button"]', HTMLElement, 'Clickable element')

    clickElement(element)

    expect(clicks).toBe(1)

    rendered.unmount()
  })

  it('changes input and select values inside React act', () => {
    const inputValues: string[] = []
    const selectValues: string[] = []
    const rendered = renderReactElement(
      <div>
        <input type="text" defaultValue="initial" onInput={(event) => inputValues.push(event.currentTarget.value)} />
        <select defaultValue="ja" onChange={(event) => selectValues.push(event.currentTarget.value)}>
          <option value="ja">Japanese</option>
          <option value="zh-CN">Chinese</option>
        </select>
      </div>,
    )
    const input = getElementBySelector(rendered.container, 'input', HTMLInputElement, 'Input')
    const select = getElementBySelector(rendered.container, 'select', HTMLSelectElement, 'Select')

    changeInputValue(input, 'updated')
    changeSelectValue(select, 'zh-CN')

    expect(input.value).toBe('updated')
    expect(select.value).toBe('zh-CN')
    expect(inputValues).toEqual(['updated'])
    expect(selectValues).toEqual(['zh-CN'])

    rendered.unmount()
  })

  it('finds and clicks checkboxes by label text with readable failures', () => {
    const checkedValues: boolean[] = []
    const rendered = renderReactElement(
      <div>
        <label>
          <input
            type="checkbox"
            defaultChecked={false}
            onChange={(event) => checkedValues.push(event.currentTarget.checked)}
          />
          Include translated tags
        </label>
      </div>,
    )

    expect(getCheckboxByLabel(rendered.container, 'Include translated tags').checked).toBe(false)

    clickCheckboxByLabel(rendered.container, 'Include translated tags')

    expect(getCheckboxByLabel(rendered.container, 'Include translated tags').checked).toBe(true)
    expect(checkedValues).toEqual([true])
    expect(() => getCheckboxByLabel(rendered.container, 'Missing checkbox')).toThrow(
      'Checkbox for "Missing checkbox" was not found',
    )

    rendered.unmount()
  })

  it('finds elements by selector and expected element type', () => {
    const rendered = renderReactElement(
      <div>
        <a href="/novel/123">Novel</a>
        <output data-state="ready" />
      </div>,
    )

    const link = getElementBySelector(
      rendered.container,
      'a',
      HTMLAnchorElement,
      'Novel link',
    )
    const output = getElementBySelector(
      rendered.container,
      'output',
      HTMLOutputElement,
      'State output',
    )

    expect(link.href).toContain('/novel/123')
    expect(output.dataset.state).toBe('ready')
    expect(() =>
      getElementBySelector(rendered.container, 'button', HTMLButtonElement, 'Action button')
    ).toThrow('Action button was not found')

    rendered.unmount()
  })

  it('finds anchors by exact href with readable failures', () => {
    const rendered = renderReactElement(
      <div>
        <a href="/search?word=五悠">Search</a>
        <a href="/history">History</a>
      </div>,
    )

    expect(getAnchorByHref(rendered.container, '/search?word=五悠').textContent).toBe('Search')
    expect(() => getAnchorByHref(rendered.container, '/missing')).toThrow('Anchor with href "/missing" was not found')

    rendered.unmount()
  })

  it('finds all elements by selector and expected element type', () => {
    const rendered = renderReactElement(
      <div>
        <input type="date" defaultValue="2026-04-26" />
        <input type="date" defaultValue="2026-05-01" />
      </div>,
    )

    const inputs = getElementsBySelector(
      rendered.container,
      'input[type="date"]',
      HTMLInputElement,
      'Date inputs',
    )

    expect(inputs.map((input) => input.value)).toEqual(['2026-04-26', '2026-05-01'])
    expect(() =>
      getElementsBySelector(rendered.container, 'select', HTMLSelectElement, 'Language selects')
    ).toThrow('Language selects were not found')

    rendered.unmount()
  })

  it('reads text content by test id with a readable missing-element failure', () => {
    const rendered = renderReactElement(
      <div>
        <output data-testid="state">ready</output>
      </div>,
    )

    expect(getTextByTestId(rendered.container, 'state')).toBe('ready')
    expect(() => getTextByTestId(rendered.container, 'missing')).toThrow('Element with test id "missing" was not found')

    rendered.unmount()
  })
})
