import { act } from 'react'
import type { ReactElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { enableReactActEnvironment } from './reactActEnvironment'

enableReactActEnvironment()

interface RenderReactElementOptions {
  wrapper?: (element: ReactElement) => ReactElement
}

export interface RenderedReactElement {
  container: HTMLElement
  root: Root
  unmount: () => void
}

export function renderReactElement(
  element: ReactElement,
  options: RenderReactElementOptions = {},
): RenderedReactElement {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  const renderedElement = options.wrapper ? options.wrapper(element) : element

  act(() => {
    root.render(renderedElement)
  })

  return {
    container,
    root,
    unmount: () => {
      act(() => root.unmount())
      container.remove()
    },
  }
}

export function getButtonByText(container: HTMLElement, text: string) {
  return getButton(container, (buttonText) => buttonText === text, `Button "${text}" was not found`)
}

export function getButtonContainingText(container: HTMLElement, text: string) {
  return getButton(
    container,
    (buttonText) => buttonText.includes(text),
    `Button containing text "${text}" was not found`,
  )
}

export function getButtonByLabel(container: ParentNode, label: string) {
  const button = Array.from(container.querySelectorAll('button')).find((element) =>
    element.getAttribute('aria-label') === label
  )

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`Button with label "${label}" was not found`)
  }

  return button
}

export function clickButtonByText(container: HTMLElement, text: string) {
  clickButton(getButtonByText(container, text))
}

export function clickButtonContainingText(container: HTMLElement, text: string) {
  clickButton(getButtonContainingText(container, text))
}

export function clickButtonByLabel(container: ParentNode, label: string) {
  clickButton(getButtonByLabel(container, label))
}

export function getCheckboxByLabel(container: ParentNode, label: string) {
  const labelElement = Array.from(container.querySelectorAll('label')).find((element) =>
    (element.textContent ?? '').includes(label)
  )
  const checkbox = labelElement?.querySelector('input[type="checkbox"]')

  if (!(checkbox instanceof HTMLInputElement)) {
    throw new Error(`Checkbox for "${label}" was not found`)
  }

  return checkbox
}

export function getAnchorByHref(container: ParentNode, href: string) {
  const anchor = Array.from(container.querySelectorAll('a')).find((element) =>
    element.getAttribute('href') === href
  )

  if (!(anchor instanceof HTMLAnchorElement)) {
    throw new Error(`Anchor with href "${href}" was not found`)
  }

  return anchor
}

export function clickCheckboxByLabel(container: ParentNode, label: string) {
  clickElement(getCheckboxByLabel(container, label))
}

export function clickElement(element: HTMLElement) {
  act(() => {
    element.click()
  })
}

export function changeInputValue(input: HTMLInputElement, value: string) {
  act(() => {
    input.value = value
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

export function changeSelectValue(select: HTMLSelectElement, value: string) {
  act(() => {
    select.value = value
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

export function getElementBySelector<TElement extends Element>(
  container: ParentNode,
  selector: string,
  elementType: { new (...args: never[]): TElement },
  label: string,
) {
  const element = container.querySelector(selector)

  if (!(element instanceof elementType)) {
    throw new Error(`${label} was not found`)
  }

  return element
}

export function getElementsBySelector<TElement extends Element>(
  container: ParentNode,
  selector: string,
  elementType: { new (...args: never[]): TElement },
  label: string,
) {
  const elements = Array.from(container.querySelectorAll(selector))

  if (elements.length === 0 || elements.some((element) => !(element instanceof elementType))) {
    throw new Error(`${label} were not found`)
  }

  return elements as TElement[]
}

export function getTextByTestId(container: ParentNode, testId: string) {
  return getElementBySelector(
    container,
    `[data-testid="${testId}"]`,
    HTMLElement,
    `Element with test id "${testId}"`,
  ).textContent ?? ''
}

function clickButton(button: HTMLButtonElement) {
  clickElement(button)
}

function getButton(
  container: HTMLElement,
  matches: (buttonText: string) => boolean,
  errorMessage: string,
) {
  const button = Array.from(container.querySelectorAll('button')).find((element) =>
    matches(element.textContent ?? '')
  )

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(errorMessage)
  }

  return button
}
