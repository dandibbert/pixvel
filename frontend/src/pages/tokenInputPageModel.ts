import { getErrorMessage } from '../utils/errorLog'

interface TokenSubmitDisabledInput {
  isLoading: boolean
  refreshToken: string
}

export function buildTokenDocumentTitle(defaultTitle: string) {
  return defaultTitle
}

export function isTokenSubmitDisabled({
  isLoading,
  refreshToken,
}: TokenSubmitDisabledInput) {
  return isLoading || !refreshToken.trim()
}

export function getTokenAuthErrorMessage(error: unknown, fallbackMessage: string) {
  return getErrorMessage(error, fallbackMessage)
}
