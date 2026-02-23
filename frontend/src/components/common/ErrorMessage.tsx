import { useI18n } from '../../i18n/useI18n'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

export default function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  const { t } = useI18n()

  return (
    <div className={`bg-accent/10 border-l-[12px] border-accent rounded-r-xl p-8 md:p-10 ${className}`}>
      <div className="flex items-start space-x-6">
        <div className="bg-accent text-white p-3 rounded-lg flex-shrink-0">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-accent mb-2 uppercase tracking-tight">{t('common.errorTitle')}</h3>
          <p className="text-lg font-bold text-foreground/60 leading-tight">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-6 h-14 px-8 bg-accent text-white rounded-lg font-black hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm"
            >
              {t('common.retry')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ message, icon }: { message?: string; icon?: React.ReactNode }) {
  const { t } = useI18n()

  return (
    <div className="text-center py-20 md:py-32 bg-muted/20 rounded-2xl">
      {icon || (
        <div className="flex justify-center mb-8">
          <div className="p-8 bg-muted rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-foreground/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
        </div>
      )}
      <p className="text-2xl font-black text-foreground/30 uppercase tracking-widest">{message || t('common.noData')}</p>
    </div>
  )
}
