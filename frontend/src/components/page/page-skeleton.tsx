import { Skeleton } from '@/components/ui/skeleton'

export function PageSkeleton({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div
      data-slot="page-skeleton"
      role="status"
      aria-label="Carregamento da página"
      aria-busy="true"
      className="space-y-6 motion-reduce:[&_[data-slot=skeleton]]:animate-none"
    >
      <div aria-hidden="true" className="space-y-6">
        {showHeader && (
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-48 max-w-full" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </div>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-3 rounded-xl border p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32 max-w-full" />
              <Skeleton className="h-3 w-40 max-w-full" />
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-xl border">
          <div className="border-b p-4">
            <Skeleton className="h-6 w-48 max-w-full" />
          </div>
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-6 border-b p-4 last:border-0"
            >
              <Skeleton className="h-5 w-full max-w-64" />
              <Skeleton className="h-5 w-16 shrink-0" />
              <Skeleton className="ml-auto h-5 w-24 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
