import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clickButtonByText, getTextByTestId, renderReactElement } from '../test/domTestUtils'
import { useStoredStringState } from './useStoredStringState'

function createStorage(overrides: Partial<Pick<Storage, 'getItem' | 'setItem'>>): Storage {
  return {
    get length() {
      return 0
    },
    clear: vi.fn(),
    getItem: vi.fn(() => null),
    key: vi.fn(() => null),
    removeItem: vi.fn(),
    setItem: vi.fn(),
    ...overrides,
  }
}

function StoredStringProbe({
  storage,
  storageKey,
}: {
  storage: Storage
  storageKey: string
}) {
  const [value, setValue] = useStoredStringState(storage, storageKey)

  return (
    <div>
      <button type="button" onClick={() => setValue('updated')}>
        Update
      </button>
      <span data-testid="value">{value}</span>
    </div>
  )
}

function renderStoredStringProbe(storage: Storage, storageKey: string) {
  return renderReactElement(<StoredStringProbe storage={storage} storageKey={storageKey} />)
}

describe('useStoredStringState', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('initializes from storage and persists later string updates', () => {
    const setItem = vi.fn()
    const storage = createStorage({
      getItem: vi.fn((key: string) => (key === 'saved-key' ? 'saved value' : null)),
      setItem,
    })

    const { container, unmount } = renderStoredStringProbe(storage, 'saved-key')

    expect(getTextByTestId(container, 'value')).toBe('saved value')

    clickButtonByText(container, 'Update')

    expect(getTextByTestId(container, 'value')).toBe('updated')
    expect(setItem).toHaveBeenCalledWith('saved-key', 'updated')

    unmount()
  })

  it('keeps state usable when storage reads or writes throw', () => {
    const storage = createStorage({
      getItem: vi.fn(() => {
        throw new Error('storage unavailable')
      }),
      setItem: vi.fn(() => {
        throw new Error('storage unavailable')
      }),
    })

    const { container, unmount } = renderStoredStringProbe(storage, 'saved-key')

    expect(getTextByTestId(container, 'value')).toBe('')

    clickButtonByText(container, 'Update')

    expect(getTextByTestId(container, 'value')).toBe('updated')

    unmount()
  })

  it('reloads the stored value when the storage key changes', () => {
    const storage = createStorage({
      getItem: vi.fn((key: string) => (key === 'first-key' ? 'first value' : 'second value')),
    })
    const { container, root, unmount } = renderStoredStringProbe(storage, 'first-key')

    expect(getTextByTestId(container, 'value')).toBe('first value')

    act(() => {
      root.render(<StoredStringProbe storage={storage} storageKey="second-key" />)
    })

    expect(getTextByTestId(container, 'value')).toBe('second value')

    unmount()
  })
})
