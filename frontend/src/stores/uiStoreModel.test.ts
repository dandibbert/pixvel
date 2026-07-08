import { describe, expect, it } from 'vitest'
import {
  buildClosedModalMap,
  buildNextThemeState,
  buildOpenedModalMap,
  buildSearchModalToggleState,
  buildSidebarToggleState,
  buildThemeState,
  getNextTheme,
  type Modal,
  type ModalData,
} from './uiStoreModel'

describe('uiStoreModel', () => {
  it('toggles between light and dark themes', () => {
    expect(getNextTheme('light')).toBe('dark')
    expect(getNextTheme('dark')).toBe('light')
  })

  it('builds theme store state from explicit and toggled theme values', () => {
    expect(buildThemeState('dark')).toEqual({
      theme: 'dark',
    })
    expect(buildNextThemeState('light')).toEqual({
      theme: 'dark',
    })
    expect(buildNextThemeState('dark')).toEqual({
      theme: 'light',
    })
  })

  it('builds sidebar and search modal toggle state', () => {
    expect(buildSidebarToggleState(false)).toEqual({
      isSidebarOpen: true,
    })
    expect(buildSidebarToggleState(true)).toEqual({
      isSidebarOpen: false,
    })
    expect(buildSearchModalToggleState(false)).toEqual({
      isSearchModalOpen: true,
    })
    expect(buildSearchModalToggleState(true)).toEqual({
      isSearchModalOpen: false,
    })
  })

  it('opens modals while preserving existing entries and typed payload data', () => {
    const payload: ModalData = { novelId: '123', source: 'preview' }
    const existing: Record<string, Modal> = {
      settings: {
        id: 'settings',
        isOpen: true,
      },
    }

    expect(buildOpenedModalMap(existing, 'novel-preview', payload)).toEqual({
      settings: {
        id: 'settings',
        isOpen: true,
      },
      'novel-preview': {
        id: 'novel-preview',
        isOpen: true,
        data: payload,
      },
    })
  })

  it('closes existing modals and ignores missing modal ids', () => {
    const existing: Record<string, Modal> = {
      'novel-preview': {
        id: 'novel-preview',
        isOpen: true,
        data: { novelId: '123' },
      },
    }

    expect(buildClosedModalMap(existing, 'novel-preview')).toEqual({
      'novel-preview': {
        id: 'novel-preview',
        isOpen: false,
        data: { novelId: '123' },
      },
    })
    expect(buildClosedModalMap(existing, 'missing')).toBe(existing)
  })
})
