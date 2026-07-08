export type Theme = 'light' | 'dark'
export type ModalData = Record<string, unknown>

export interface Modal {
  id: string
  isOpen: boolean
  data?: ModalData
}

export function getNextTheme(theme: Theme): Theme {
  return theme === 'light' ? 'dark' : 'light'
}

export function buildThemeState(theme: Theme) {
  return {
    theme,
  }
}

export function buildNextThemeState(theme: Theme) {
  return buildThemeState(getNextTheme(theme))
}

export function buildSidebarToggleState(isSidebarOpen: boolean) {
  return {
    isSidebarOpen: !isSidebarOpen,
  }
}

export function buildSearchModalToggleState(isSearchModalOpen: boolean) {
  return {
    isSearchModalOpen: !isSearchModalOpen,
  }
}

export function buildOpenedModalMap(
  modals: Record<string, Modal>,
  id: string,
  data?: ModalData,
) {
  return {
    ...modals,
    [id]: { id, isOpen: true, data },
  }
}

export function buildClosedModalMap(
  modals: Record<string, Modal>,
  id: string,
) {
  const modal = modals[id]
  if (!modal) return modals

  return {
    ...modals,
    [id]: { ...modal, isOpen: false },
  }
}
