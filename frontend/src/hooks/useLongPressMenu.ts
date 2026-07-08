import { useCallback, useEffect, useRef, useState } from 'react'

interface UseLongPressMenuOptions {
  delayMs: number
}

interface MenuPosition {
  x: number
  y: number
}

export function useLongPressMenu({ delayMs }: UseLongPressMenuOptions) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ x: 0, y: 0 })
  const timerRef = useRef<number | null>(null)
  const longPressTriggeredRef = useRef(false)

  const clearLongPressTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startLongPress = useCallback((x: number, y: number) => {
    setMenuPosition({ x, y })
    longPressTriggeredRef.current = false
    clearLongPressTimer()
    timerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true
      setIsMenuOpen(true)
      timerRef.current = null
    }, delayMs)
  }, [clearLongPressTimer, delayMs])

  const cancelLongPress = useCallback(() => {
    clearLongPressTimer()
    longPressTriggeredRef.current = false
  }, [clearLongPressTimer])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
    longPressTriggeredRef.current = false
  }, [])

  const consumeLongPressTrigger = useCallback(() => {
    if (!longPressTriggeredRef.current) {
      return false
    }

    longPressTriggeredRef.current = false
    return true
  }, [])

  useEffect(() => {
    return () => {
      clearLongPressTimer()
    }
  }, [clearLongPressTimer])

  return {
    isMenuOpen,
    menuPosition,
    startLongPress,
    clearLongPressTimer,
    cancelLongPress,
    closeMenu,
    consumeLongPressTrigger,
  }
}
