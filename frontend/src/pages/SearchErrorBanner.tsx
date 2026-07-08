interface SearchErrorBannerProps {
  error: string
  onClear: () => void
}

export default function SearchErrorBanner({ error, onClear }: SearchErrorBannerProps) {
  return (
    <div className="mb-6 md:mb-8 p-4 md:p-6 bg-accent/10 border-l-4 border-accent rounded-r-lg flex items-center justify-between">
      <p className="text-accent font-bold text-base md:text-lg">{error}</p>
      <button
        onClick={onClear}
        className="text-accent hover:scale-125 transition-transform p-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
