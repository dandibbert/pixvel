import { describe, expect, it, vi } from 'vitest'
import { getErrorMessage, logErrorDescriptor } from './errorLog'

describe('errorLog', () => {
  it('resolves Error messages before falling back to the provided message', () => {
    expect(getErrorMessage(new Error('ERR_LOAD_FAILED'), 'fallback')).toBe('ERR_LOAD_FAILED')
    expect(getErrorMessage('raw failure', 'fallback')).toBe('fallback')
  })

  it('delegates error descriptors to the provided logger', () => {
    const logger = vi.fn()
    const error = new Error('ERR_LOAD_FAILED')

    logErrorDescriptor(
      {
        label: 'Load error:',
        value: error,
      },
      logger,
    )

    expect(logger).toHaveBeenCalledWith('Load error:', error)
  })
})
