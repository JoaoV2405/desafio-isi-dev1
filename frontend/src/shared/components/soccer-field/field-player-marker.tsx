import { HeartPlus } from 'lucide-react'
import { getFieldSlotLabel } from './lineup-occupants'
import type {
  FieldPlayer,
  FieldPresentation,
  FieldSlot,
  MatchSide,
} from './types'
import { AvatarBadge } from '@/components/ui/avatar'
import { getPlayerInitials } from '@/shared/lib/player-presentation'
import { PLAYER_CONDITIONS, PLAYER_POSITIONS } from '@/shared/types/player'
import { cn } from '@/lib/utils'

interface FieldPlayerMarkerProps {
  slot: FieldSlot
  player?: FieldPlayer | null
  side?: MatchSide
  showName?: boolean
  presentation?: FieldPresentation
}

export function FieldPlayerMarker({
  slot,
  player,
  side = 'home',
  showName = true,
  presentation = 'match',
}: FieldPlayerMarkerProps) {
  const slotLabel = getFieldSlotLabel(slot)
  const description = player
    ? `${slotLabel}: ${player.name}, ${PLAYER_POSITIONS[player.position]}${player.condition ? `, ${PLAYER_CONDITIONS[player.condition]}` : ''}`
    : `${slotLabel}: vaga vazia`

  return (
    <li
      className="soccer-field-marker"
      data-slot-id={slot.id}
      data-occupied={Boolean(player)}
      data-side={side}
      aria-label={description}
      title={description}
      style={{
        left: `${slot.position.x * 100}%`,
        top: `${slot.position.y * 100}%`,
      }}
    >
      <span
        aria-hidden="true"
        className={cn(
          'soccer-field-marker-circle',
          player
            ? presentation === 'lineup'
              ? 'border-white bg-blue-600 text-white'
              : side === 'away'
                ? 'border-amber-100 bg-amber-200 text-amber-950'
                : 'border-white bg-white text-green-950'
            : side === 'away'
              ? 'border-dashed border-amber-200 bg-green-950/20 text-amber-100'
              : 'border-dashed border-white/90 bg-green-950/20 text-white',
        )}
      >
        {player ? getPlayerInitials(player.name) : '+'}
      </span>
      {presentation === 'lineup' &&
        player?.condition === 'MAL_CONDICIONADO' && (
          <AvatarBadge
            aria-hidden="true"
            className="soccer-field-marker-condition top-0 right-auto bottom-auto left-0 bg-warning text-white ring-white"
          >
            <HeartPlus aria-hidden="true" />
          </AvatarBadge>
        )}
      {showName && (
        <span aria-hidden="true" className="soccer-field-marker-name">
          {player?.name ?? slotLabel}
        </span>
      )}
    </li>
  )
}
