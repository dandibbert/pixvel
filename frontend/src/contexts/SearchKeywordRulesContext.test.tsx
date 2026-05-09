import { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  SearchKeywordRulesProvider,
  useSearchKeywordRules,
} from './SearchKeywordRulesContext'

const memoryStorage = new Map<string, string>()

type TestStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear'>

function installLocalStorage(storage: TestStorage) {
  Object.defineProperty(window, 'localStorage', {
    value: storage,
    configurable: true,
  })
}

function installMemoryLocalStorage() {
  installLocalStorage({
    getItem: (key: string) => memoryStorage.get(key) ?? null,
    setItem: (key: string, value: string) => memoryStorage.set(key, value),
    removeItem: (key: string) => memoryStorage.delete(key),
    clear: () => memoryStorage.clear(),
  })
}

installMemoryLocalStorage()

function RulesHarness() {
  const {
    blockedWordsInput,
    highlightWordsInput,
    blockedWords,
    highlightWords,
    setBlockedWordsInput,
    setHighlightWordsInput,
  } = useSearchKeywordRules()

  return (
    <div>
      <button type="button" onClick={() => setBlockedWordsInput('ネタバレ, 地雷')}>
        Set blocked
      </button>
      <button type="button" onClick={() => setHighlightWordsInput('甘い')}>
        Set highlight
      </button>
      <div data-testid="blocked-input">{blockedWordsInput}</div>
      <div data-testid="highlight-input">{highlightWordsInput}</div>
      <div data-testid="blocked-count">{blockedWords.length}</div>
      <div data-testid="highlight-count">{highlightWords.length}</div>
    </div>
  )
}

function renderRulesProvider() {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const root = createRoot(container)

  act(() => {
    root.render(
      <SearchKeywordRulesProvider>
        <RulesHarness />
      </SearchKeywordRulesProvider>,
    )
  })

  return { container, root }
}

function unmount(root: Root, container: HTMLElement) {
  act(() => root.unmount())
  container.remove()
}

function getText(container: HTMLElement, testId: string) {
  return container.querySelector(`[data-testid="${testId}"]`)?.textContent ?? ''
}

function getButton(container: HTMLElement, text: string) {
  const button = Array.from(container.querySelectorAll('button')).find((element) => element.textContent === text)

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`Button "${text}" was not found`)
  }

  return button
}

describe('SearchKeywordRulesContext', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    memoryStorage.clear()
    installMemoryLocalStorage()
  })

  it('restores keyword rule inputs after remounting the provider', () => {
    const firstRender = renderRulesProvider()

    act(() => {
      getButton(firstRender.container, 'Set blocked').click()
      getButton(firstRender.container, 'Set highlight').click()
    })

    expect(getText(firstRender.container, 'blocked-input')).toBe('ネタバレ, 地雷')
    expect(getText(firstRender.container, 'highlight-input')).toBe('甘い')

    unmount(firstRender.root, firstRender.container)

    const secondRender = renderRulesProvider()

    expect(getText(secondRender.container, 'blocked-input')).toBe('ネタバレ, 地雷')
    expect(getText(secondRender.container, 'highlight-input')).toBe('甘い')
    expect(getText(secondRender.container, 'blocked-count')).toBe('2')
    expect(getText(secondRender.container, 'highlight-count')).toBe('1')

    unmount(secondRender.root, secondRender.container)
  })

  it('keeps keyword rules usable when localStorage throws', () => {
    installLocalStorage({
      getItem: () => {
        throw new Error('storage unavailable')
      },
      setItem: () => {
        throw new Error('storage unavailable')
      },
      removeItem: () => {
        throw new Error('storage unavailable')
      },
      clear: () => {
        throw new Error('storage unavailable')
      },
    })

    const { container, root } = renderRulesProvider()

    act(() => {
      getButton(container, 'Set blocked').click()
      getButton(container, 'Set highlight').click()
    })

    expect(getText(container, 'blocked-input')).toBe('ネタバレ, 地雷')
    expect(getText(container, 'highlight-input')).toBe('甘い')
    expect(getText(container, 'blocked-count')).toBe('2')
    expect(getText(container, 'highlight-count')).toBe('1')

    installMemoryLocalStorage()
    unmount(root, container)
  })
})
