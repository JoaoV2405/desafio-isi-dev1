import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function PenaltyRateBadge({ rate }: { rate: number }) {
  const color =
    rate === 0 ? 'bg-success' : rate < 20 ? 'bg-warning' : 'bg-destructive'
  const variant = rate === 0 ? 'success' : rate < 20 ? 'warning' : 'destructive'

  return (
    <Badge variant={variant} className="gap-2 tabular-nums">
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', color)} />
      {rate}%
    </Badge>
  )
}
