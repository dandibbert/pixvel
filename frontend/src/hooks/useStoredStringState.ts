import { useCallback, useEffect, useState } from 'react'
import { readStorageItem, writeStorageItem } from '../utils/safeStorage'

export function useStoredStringState(storage: Storage, key: string) {
  const [value, setValueState] = useState(() => readStorageItem(storage, key))

  useEffect(() => {
    setValueState(readStorageItem(storage, key))
  }, [key, storage])

  const setValue = useCallback((nextValue: string) => {
    writeStorageItem(storage, key, nextValue)
    setValueState(nextValue)
  }, [key, storage])

  return [value, setValue] as const
}
