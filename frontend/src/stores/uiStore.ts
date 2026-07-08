import { create } from 'zustand'
import {
  buildClosedModalMap,
  buildNextThemeState,
  buildOpenedModalMap,
  buildSearchModalToggleState,
  buildSidebarToggleState,
  buildThemeState,
  type Modal,
  type ModalData,
  type Theme,
} from './uiStoreModel'

export type { Modal, ModalData, Theme } from './uiStoreModel'

export interface UiState {
  theme: Theme
  modals: Record<string, Modal>
  isSidebarOpen: boolean
  isSearchModalOpen: boolean

  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  openModal: (id: string, data?: ModalData) => void
  closeModal: (id: string) => void
  toggleSidebar: () => void
  toggleSearchModal: () => void
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  modals: {},
  isSidebarOpen: false,
  isSearchModalOpen: false,

  setTheme: (theme) => set(buildThemeState(theme)),

  toggleTheme: () =>
    set((state) => buildNextThemeState(state.theme)),

  openModal: (id, data) =>
    set((state) => ({
      modals: buildOpenedModalMap(state.modals, id, data),
    })),

  closeModal: (id) =>
    set((state) => ({
      modals: buildClosedModalMap(state.modals, id),
    })),

  toggleSidebar: () =>
    set((state) => buildSidebarToggleState(state.isSidebarOpen)),

  toggleSearchModal: () =>
    set((state) => buildSearchModalToggleState(state.isSearchModalOpen)),
}))
