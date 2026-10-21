import type { ReactNode } from 'react'
import type { PlayerPosition } from '@/shared/types/player'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { getPlayerInitials } from '@/shared/lib/player-presentation'
import { PLAYER_POSITIONS } from '@/shared/types/player'

export interface PlayerIdentityProps {
  name: string
  position: PlayerPosition
  age?: number
  description?: ReactNode
  className?: string
}

export function PlayerIdentity({
  name,
  position,
  age,
  description,
  className,
}: PlayerIdentityProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar size="lg" aria-hidden="true">
        <AvatarFallback className="bg-avatar-zinc text-avatar-zinc-foreground">
          {getPlayerInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-medium">{name}</p>
        {/* Permite compor a descrição com badges no drawer, preservando o resumo dos demais contextos. */}
        <div className="text-xs text-muted-foreground tabular-nums">
          {description ?? (
            <>
              {age !== undefined && `${position} · `}
              {PLAYER_POSITIONS[position]}
              {age !== undefined && ` · ${age} anos`}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
