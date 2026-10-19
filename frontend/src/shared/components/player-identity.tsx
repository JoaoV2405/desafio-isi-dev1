import type { PlayerPosition } from '@/shared/types/player'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { getPlayerInitials } from '@/shared/lib/player-presentation'
import { PLAYER_POSITIONS } from '@/shared/types/player'

export interface PlayerIdentityProps {
  name: string
  position: PlayerPosition
  age?: number
  className?: string
}

export function PlayerIdentity({
  name,
  position,
  age,
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
          {/* O resumo compacto acrescenta sigla e idade quando o contexto precisa desses dados. */}
          {age !== undefined && `${position} · `}
          {PLAYER_POSITIONS[position]}
          {age !== undefined && ` · ${age} anos`}
        </p>
      </div>
    </div>
  )
}
