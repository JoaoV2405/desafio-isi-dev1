import type { PlayerPosition } from '@/shared/types/player'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { getPlayerInitials } from '@/shared/lib/player-presentation'
import { PLAYER_POSITIONS } from '@/shared/types/player'

export interface PlayerIdentityProps {
  name: string
  position: PlayerPosition
  className?: string
}

export function PlayerIdentity({
  name,
  position,
  className,
}: PlayerIdentityProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar size="lg" aria-hidden="true">
        <AvatarFallback>{getPlayerInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">
          {PLAYER_POSITIONS[position]}
        </p>
      </div>
    </div>
  )
}
