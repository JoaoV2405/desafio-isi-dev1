import { FieldPlayerMarker } from './field-player-marker'
import { getMatchFormationSlots } from './formations'
import { SoccerFieldBackground } from './soccer-field-background'
import type { FieldTeam } from './types'
import { cn } from '@/lib/utils'
import './soccer-field.css'

interface MatchFieldProps {
  home: FieldTeam
  away: FieldTeam
  showNames?: boolean
  className?: string
}

/** Supply the match's historical participants when integrating with snapshots. */
export function MatchField({
  home,
  away,
  showNames = true,
  className,
}: MatchFieldProps) {
  return (
    <figure className={cn('space-y-3', className)}>
      <figcaption className="flex flex-wrap justify-between gap-3 text-sm">
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="size-3 shrink-0 rounded-full border bg-white"
          />
          <span>
            <span className="font-medium">{home.name}</span>
            <span className="block text-xs text-muted-foreground">
              Mandante · {home.acronym && `${home.acronym} · `}
              {home.formation} →
            </span>
          </span>
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="size-3 shrink-0 rounded-full border border-amber-300 bg-amber-200"
          />
          <span>
            <span className="font-medium">{away.name}</span>
            <span className="block text-xs text-muted-foreground">
              ← Visitante · {away.acronym && `${away.acronym} · `}
              {away.formation}
            </span>
          </span>
        </span>
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
