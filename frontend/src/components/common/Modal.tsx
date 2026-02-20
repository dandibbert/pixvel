import { ReactNode, useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end md:items-center justify-center p-0 md:p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        <div
          className={`relative bg-white rounded-t-xl md:rounded-xl border-t-4 md:border-4 border-primary ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}
        >
          {title && (
            <div className="flex items-center justify-between p-6 md:p-8 border-b-2 border-muted">
              <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">{title}</h3>
              <button
                onClick={onClose}
                className="text-foreground/40 hover:text-primary hover:scale-110 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
              >
                <svg
                  className="w-6 h-6 md:w-8 md:h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          <div className="p-6 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
