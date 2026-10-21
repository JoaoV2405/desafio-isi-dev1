import type { PlayerCondition } from '@/shared/types/player'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { PLAYER_CONDITIONS } from '@/shared/types/player'

const conditionVariants = {
  APTO: 'success',
  MAL_CONDICIONADO: 'warning',
  DOENTE: 'destructive',
} as const

const conditionColors: Record<PlayerCondition, string> = {
  APTO: 'bg-success',
  MAL_CONDICIONADO: 'bg-warning',
  DOENTE: 'bg-destructive',
}

export function PlayerConditionBadge({
  condition,
}: {
  condition: PlayerCondition
}) {
  return (
    <Badge variant={conditionVariants[condition]} className="gap-2">
      <span
        aria-hidden="true"
        className={cn('size-1.5 rounded-full', conditionColors[condition])}
      />
      {PLAYER_CONDITIONS[condition]}
    </Badge>
  )
}
