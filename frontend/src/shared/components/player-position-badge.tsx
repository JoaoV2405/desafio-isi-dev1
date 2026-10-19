import type { PlayerPosition } from '@/shared/types/player'
import { Badge } from '@/components/ui/badge'
import { PLAYER_POSITIONS } from '@/shared/types/player'

export function PlayerPositionBadge({
  position,
}: {
  position: PlayerPosition
}) {
  return (
    <Badge
      variant="secondary"
      className="rounded-md"
      title={PLAYER_POSITIONS[position]}
    >
      {position}
    </Badge>
  )
}
