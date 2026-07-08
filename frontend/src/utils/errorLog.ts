export interface ErrorLogDescriptor {
  label: string
  value: unknown
}

export type ErrorLogger = (label: string, value: unknown) => void

export function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage
}

export function logErrorDescriptor(
  descriptor: ErrorLogDescriptor,
  logger: ErrorLogger = console.error,
) {
  logger(descriptor.label, descriptor.value)
}
