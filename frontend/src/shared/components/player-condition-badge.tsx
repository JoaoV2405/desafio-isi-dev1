import type { PlayerCondition } from '@/shared/types/player'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { PLAYER_CONDITIONS } from '@/shared/types/player'

const conditionColors: Record<PlayerCondition, string> = {
  APTO: 'bg-green-500',
  MAL_CONDICIONADO: 'bg-yellow-500',
  DOENTE: 'bg-red-500',
}

export function PlayerConditionBadge({
  condition,
}: {
  condition: PlayerCondition
}) {
  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <span
        aria-hidden="true"
        className={cn('size-1.5 rounded-full', conditionColors[condition])}
      />
      {PLAYER_CONDITIONS[condition]}
    </Badge>
  )
}
