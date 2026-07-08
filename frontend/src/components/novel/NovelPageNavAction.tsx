import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type NovelPageNavActionType = 'page' | 'series'

interface NovelPageNavActionProps {
  type: NovelPageNavActionType
  title: string
  ariaLabel: string
  children: ReactNode
  disabled?: boolean
  to?: string
  onClick?: () => void
}

function getNovelPageNavActionStyle(type: NovelPageNavActionType, disabled: boolean) {
  if (disabled) {
    return 'bg-muted text-foreground/25 border-2 border-transparent cursor-not-allowed'
  }

  return type === 'series'
    ? 'bg-primary/10 text-primary border-2 border-primary/30 hover:bg-primary/20 hover:border-primary shadow-sm'
    : 'bg-muted text-foreground/40 border-2 border-transparent hover:text-primary'
}

function getNovelPageNavActionSize(type: NovelPageNavActionType) {
  return type === 'series'
    ? 'h-12 min-w-[48px] px-3 md:h-14 md:min-w-[56px] md:px-4'
    : 'h-12 w-12 md:h-14 md:w-14'
}

function getNovelPageNavActionWeight(type: NovelPageNavActionType) {
  return type === 'series' ? 'font-bold' : 'font-black'
}

export default function NovelPageNavAction({
  type,
  title,
  ariaLabel,
  children,
  disabled = false,
  to,
  onClick,
}: NovelPageNavActionProps) {
  const className = `${getNovelPageNavActionSize(type)} ${getNovelPageNavActionWeight(type)} rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all ${getNovelPageNavActionStyle(type, disabled)}`

  if (to) {
    return (
      <Link
        to={to}
        className={className}
        title={title}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}
