export function hasOwnProperty<T extends object, K extends PropertyKey>(
  object: T,
  key: K,
): key is K & keyof T {
  return Object.prototype.hasOwnProperty.call(object, key)
}

export function pickProperties<T extends object, K extends keyof T>(
  object: T,
  keys: ReadonlyArray<K>,
): Pick<T, K> {
  return Object.fromEntries(
    keys.map((key) => [key, object[key]]),
  ) as Pick<T, K>
}

export function mapKeysToObject<K extends PropertyKey, V>(
  keys: ReadonlyArray<K>,
  mapValue: (key: K) => V,
): Record<K, V> {
  return Object.fromEntries(
    keys.map((key) => [key, mapValue(key)]),
  ) as Record<K, V>
}

export function mapItemsToObject<T, K extends PropertyKey, V>(
  items: ReadonlyArray<T>,
  mapEntry: (item: T) => readonly [K, V],
): Record<K, V> {
  return Object.fromEntries(items.map(mapEntry)) as Record<K, V>
}
