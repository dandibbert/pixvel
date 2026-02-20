interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`inline-block ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-pixiv-blue rounded-full animate-spin`}
      ></div>
    </div>
  )
}

export function LoadingOverlay({ message = '加载中...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
        <Spinner size="lg" />
        <p className="text-gray-700 text-sm md:text-base">{message}</p>
      </div>
    </div>
  )
}
