import { ArrowLeft, ArrowRight } from 'lucide-react'
import { FieldPlayerMarker } from './field-player-marker'
import { getMatchFormationSlots } from './formations'
import { SoccerFieldBackground } from './soccer-field-background'
import type { FieldTeam, MatchSide } from './types'
import { cn } from '@/lib/utils'
import './soccer-field.css'

interface MatchFieldProps {
  home: FieldTeam
  away: FieldTeam
  showNames?: boolean
  className?: string
}

function TeamBadge({ team, side }: { team: FieldTeam; side: MatchSide }) {
  const Arrow = side === 'home' ? ArrowRight : ArrowLeft
  return (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 rounded-md bg-black/55 px-3 py-2 text-xs text-white">
      <span
        aria-hidden="true"
        className={cn(
          'size-2 shrink-0 rounded-full',
          side === 'home' ? 'bg-blue-600' : 'bg-white',
        )}
      />
      <span className="min-w-0 truncate font-medium" title={team.name}>
        {team.name}
      </span>
      <span>{team.formation}</span>
      <span aria-hidden="true">|</span>
      <span className="inline-flex items-center gap-1">
        ataca <Arrow aria-hidden="true" className="size-3.5" />
      </span>
    </span>
  )
}

/** Supply the match's historical participants when integrating with snapshots. */
export function MatchField({
  home,
  away,
  showNames = true,
  className,
}: MatchFieldProps) {
  return (
    <figure
      aria-label="Formações da partida"
      className={cn('relative', className)}
    >
      <figcaption className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3">
        <TeamBadge team={home} side="home" />
        <TeamBadge team={away} side="away" />
      </figcaption>
      <div className="soccer-field" data-presentation="match">
        <SoccerFieldBackground presentation="match" />
        {(['home', 'away'] as const).map((side) => {
          const team = side === 'home' ? home : away
          return (
            <ul
              key={side}
              className="soccer-field-players"
              aria-label={`${side === 'home' ? 'Mandante' : 'Visitante'}: ${team.name}`}
            >
              {getMatchFormationSlots(team.formation, side).map((slot) => (
                <FieldPlayerMarker
                  key={slot.id}
                  slot={slot}
                  player={team.occupants[slot.id]}
                  side={side}
                  showName={showNames}
                />
              ))}
            </ul>
          )
        })}
      </div>
    </figure>
  )
}
