import { create } from 'zustand'

interface Modal {
  id: string
  isOpen: boolean
  data?: any
}

interface UiState {
  theme: 'light' | 'dark'
  modals: Record<string, Modal>
  isSidebarOpen: boolean
  isSearchModalOpen: boolean

  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  openModal: (id: string, data?: any) => void
  closeModal: (id: string) => void
  toggleSidebar: () => void
  toggleSearchModal: () => void
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  modals: {},
  isSidebarOpen: false,
  isSearchModalOpen: false,

  setTheme: (theme) => set({ theme }),

  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),

  openModal: (id, data) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: { id, isOpen: true, data },
      },
    })),

  closeModal: (id) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: { ...state.modals[id], isOpen: false },
      },
    })),

  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),

  toggleSearchModal: () =>
    set((state) => ({
      isSearchModalOpen: !state.isSearchModalOpen,
    })),
}))
