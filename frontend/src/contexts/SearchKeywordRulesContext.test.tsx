import { beforeEach, describe, expect, it } from 'vitest'
import { clickButtonByText, getTextByTestId, renderReactElement } from '../test/domTestUtils'
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
  return renderReactElement(
    <SearchKeywordRulesProvider>
      <RulesHarness />
    </SearchKeywordRulesProvider>,
  )
}

describe('SearchKeywordRulesContext', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    memoryStorage.clear()
    installMemoryLocalStorage()
  })

  it('restores keyword rule inputs after remounting the provider', () => {
    const firstRender = renderRulesProvider()

    clickButtonByText(firstRender.container, 'Set blocked')
    clickButtonByText(firstRender.container, 'Set highlight')

    expect(getTextByTestId(firstRender.container, 'blocked-input')).toBe('ネタバレ, 地雷')
    expect(getTextByTestId(firstRender.container, 'highlight-input')).toBe('甘い')

    firstRender.unmount()

    const secondRender = renderRulesProvider()

    expect(getTextByTestId(secondRender.container, 'blocked-input')).toBe('ネタバレ, 地雷')
    expect(getTextByTestId(secondRender.container, 'highlight-input')).toBe('甘い')
    expect(getTextByTestId(secondRender.container, 'blocked-count')).toBe('2')
    expect(getTextByTestId(secondRender.container, 'highlight-count')).toBe('1')

    secondRender.unmount()
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

    const { container, unmount } = renderRulesProvider()

    clickButtonByText(container, 'Set blocked')
    clickButtonByText(container, 'Set highlight')

    expect(getTextByTestId(container, 'blocked-input')).toBe('ネタバレ, 地雷')
    expect(getTextByTestId(container, 'highlight-input')).toBe('甘い')
    expect(getTextByTestId(container, 'blocked-count')).toBe('2')
    expect(getTextByTestId(container, 'highlight-count')).toBe('1')

    installMemoryLocalStorage()
    unmount()
  })
})
