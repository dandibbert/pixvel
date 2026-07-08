import { describe, expect, it, vi } from 'vitest'
import {
  buildAuthorPath,
  buildNovelPath,
  buildPixivAuthPath,
  buildSeriesPath,
  navigateCurrentWindowToPath,
  openAppPathInNewTab,
} from './appNavigation'

describe('appNavigation', () => {
  it('builds internal app paths from route IDs', () => {
    expect(buildNovelPath('123')).toBe('/novel/123')
    expect(buildAuthorPath('456')).toBe('/author/456')
    expect(buildSeriesPath('789')).toBe('/series/789')
  })

  it('builds the Pixiv auth route path', () => {
    expect(buildPixivAuthPath()).toBe('/api/auth/pixiv')
  })

  it('navigates the current window by assigning href', () => {
    const location = { href: '' }

    navigateCurrentWindowToPath('/search', location)

    expect(location.href).toBe('/search')
  })

  it('opens internal paths in a safe new tab', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)

    openAppPathInNewTab('/novel/123')

    expect(open).toHaveBeenCalledWith('/novel/123', '_blank', 'noopener,noreferrer')
    open.mockRestore()
  })
})
