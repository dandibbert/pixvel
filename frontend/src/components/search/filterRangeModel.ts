export type DatePreset =
  | 'anytime'
  | 'last7Days'
  | 'last30Days'
  | 'last180Days'
  | 'last365Days'

export const DATE_PRESETS: DatePreset[] = [
  'anytime',
  'last7Days',
  'last30Days',
  'last180Days',
  'last365Days',
]

export const BOOKMARK_PRESETS = [0, 100, 500, 1000, 5000, 10000] as const

const DATE_PRESET_DAYS: Record<Exclude<DatePreset, 'anytime'>, number> = {
  last7Days: 7,
  last30Days: 30,
  last180Days: 180,
  last365Days: 365,
}

export function normalizeDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)

  return [
    digits.slice(0, 4),
    digits.slice(4, 6),
    digits.slice(6, 8),
  ].filter(Boolean).join('-')
}

export function formatDateInputValue(value: string) {
  return value.replace(/-/g, '/')
}

export function buildDatePresetRange(
  preset: DatePreset,
  today = new Date(),
) {
  if (preset === 'anytime') {
    return {
      startDate: '',
      endDate: '',
    }
  }

  const endDate = startOfLocalDay(today)
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - (DATE_PRESET_DAYS[preset] - 1))

  return {
    startDate: formatLocalIsoDate(startDate),
    endDate: formatLocalIsoDate(endDate),
  }
}

export function isValidIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

export function parseNumberInput(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits ? Number(digits) : 0
}

function startOfLocalDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function formatLocalIsoDate(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
