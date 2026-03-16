import { afterEach } from 'vitest'

afterEach(() => {
  document.body.innerHTML = ''

  if (typeof window.localStorage?.clear === 'function') {
    window.localStorage.clear()
  }
})
