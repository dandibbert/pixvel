import { beforeEach, describe, expect, it } from 'vitest'
import { useUiStore, type ModalData } from './uiStore'

const initialState = useUiStore.getInitialState()

describe('uiStore', () => {
  beforeEach(() => {
    useUiStore.setState(initialState, true)
  })

  it('toggles theme, sidebar, and search modal state', () => {
    useUiStore.getState().toggleTheme()
    useUiStore.getState().toggleSidebar()
    useUiStore.getState().toggleSearchModal()

    expect(useUiStore.getState().theme).toBe('dark')
    expect(useUiStore.getState().isSidebarOpen).toBe(true)
    expect(useUiStore.getState().isSearchModalOpen).toBe(true)
  })

  it('opens and closes modals while preserving typed payload data', () => {
    const payload: ModalData = { novelId: '123', source: 'preview' }

    useUiStore.getState().openModal('novel-preview', payload)
    useUiStore.getState().closeModal('novel-preview')

    expect(useUiStore.getState().modals['novel-preview']).toEqual({
      id: 'novel-preview',
      isOpen: false,
      data: payload,
    })
  })

  it('does not create malformed modal entries when closing an unknown modal', () => {
    useUiStore.getState().closeModal('missing')

    expect(useUiStore.getState().modals).toEqual({})
  })
})
