export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-muted rounded-md w-3/4 mb-4"></div>
      <div className="h-4 bg-muted rounded-md w-1/2 mb-4"></div>
      <div className="h-4 bg-muted rounded-md w-5/6"></div>
    </div>
  )
}

export function NovelCardSkeleton() {
  return (
    <div className="bg-muted rounded-lg overflow-hidden h-full">
      <div className="p-6 flex flex-col gap-6">
        <div className="space-y-3">
          <div className="h-8 bg-white/50 rounded-lg w-3/4 animate-pulse"></div>
          <div className="h-8 bg-white/50 rounded-lg w-1/2 animate-pulse"></div>
        </div>
        <div className="h-4 bg-white/50 rounded-lg w-1/4 animate-pulse"></div>
        <div className="flex space-x-2">
          <div className="h-8 bg-white rounded-md w-16 animate-pulse"></div>
          <div className="h-8 bg-white rounded-md w-16 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-white/50 rounded-lg w-full animate-pulse"></div>
          <div className="h-4 bg-white/50 rounded-lg w-5/6 animate-pulse"></div>
        </div>
        <div className="flex justify-between pt-4 mt-auto">
          <div className="h-4 bg-white/50 rounded-lg w-24 animate-pulse"></div>
          <div className="h-6 bg-primary/20 rounded-md w-12 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export function NovelGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <NovelCardSkeleton key={i} />
      ))}
    </div>
  )
}
