const NEW_TAB_TARGET = '_blank'
const SAFE_NEW_TAB_FEATURES = 'noopener,noreferrer'

interface CurrentWindowLocation {
  href: string
}

export function buildNovelPath(novelId: string) {
  return `/novel/${novelId}`
}

export function buildAuthorPath(authorId: string) {
  return `/author/${authorId}`
}

export function buildSeriesPath(seriesId: string) {
  return `/series/${seriesId}`
}

export function buildPixivAuthPath() {
  return '/api/auth/pixiv'
}

export function navigateCurrentWindowToPath(
  path: string,
  location: CurrentWindowLocation = window.location,
) {
  location.href = path
}

export function openAppPathInNewTab(path: string) {
  window.open(path, NEW_TAB_TARGET, SAFE_NEW_TAB_FEATURES)
}
