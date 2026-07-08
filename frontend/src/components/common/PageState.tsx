import type { ReactNode } from 'react'
import { joinClassNames } from '../../utils/classNames'

type EmptyPageStateIcon = 'book' | 'search' | 'sparkles'

interface LoadingPageStateProps {
  label: string
}

interface EmptyPageStateProps {
  label: string
  icon: EmptyPageStateIcon
  iconPulse?: boolean
  tracking?: boolean
  actionLabel?: string
  onAction?: () => void
}

const iconPaths: Record<EmptyPageStateIcon, string> = {
  book:
    'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  search:
    'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  sparkles:
    'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z',
}

function StateShell({ children }: { children: ReactNode }) {
  return (
    <div className="text-center py-16 md:py-24 bg-muted/50 rounded-xl">
      {children}
    </div>
  )
}

export function LoadingPageState({ label }: LoadingPageStateProps) {
  return (
    <div className="text-center py-16 md:py-20">
      <div className="inline-block animate-bounce h-12 w-12 md:h-16 md:w-16 bg-primary rounded-lg flex items-center justify-center">
        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 md:mt-6 text-lg md:text-2xl font-bold text-primary uppercase tracking-widest">{label}</p>
    </div>
  )
}

export function EmptyPageState({
  label,
  icon,
  iconPulse = false,
  tracking = false,
  actionLabel,
  onAction,
}: EmptyPageStateProps) {
  const iconColor = icon === 'sparkles' ? 'text-primary/20' : 'text-foreground/10'
  const labelClasses = joinClassNames(
    'text-xl md:text-2xl font-bold text-foreground/30 uppercase',
    tracking && 'tracking-widest',
    actionLabel && 'mb-6',
  )

  return (
    <StateShell>
      <div className="flex justify-center mb-6 md:mb-8">
        <div className={joinClassNames('p-6 md:p-8 bg-muted rounded-full', iconPulse && 'animate-pulse')}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            data-icon={icon}
            className={`h-16 w-16 md:h-20 md:w-20 ${iconColor}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[icon]} />
          </svg>
        </div>
      </div>
      <p className={labelClasses}>{label}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-8 py-3 md:px-10 md:py-4 bg-primary text-white font-bold rounded-lg hover:scale-105 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </StateShell>
  )
}
