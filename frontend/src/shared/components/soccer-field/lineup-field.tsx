import { FieldPlayerMarker } from './field-player-marker'
import { FORMATION_LAYOUTS } from './formations'
import { SoccerFieldBackground } from './soccer-field-background'
import type { FieldOccupants, SoccerFormation } from './types'
import { cn } from '@/lib/utils'
import './soccer-field.css'

interface LineupFieldProps {
  formation: SoccerFormation
  occupants: FieldOccupants
  label?: string
  showNames?: boolean
  className?: string
}

/** Controlled preview: formation changes and player choices belong to the caller. */
export function LineupField({
  formation,
  occupants,
  label = 'Escalação',
  showNames = true,
  className,
}: LineupFieldProps) {
  return (
    <div
      role="group"
      aria-label={`${label} · Formação ${formation}`}
      data-presentation="lineup"
      className={cn('soccer-field', className)}
    >
      <SoccerFieldBackground presentation="lineup" />
      <ul className="soccer-field-players" aria-label="Vagas da escalação">
        {FORMATION_LAYOUTS[formation].map((slot) => (
          <FieldPlayerMarker
            key={slot.id}
            slot={slot}
            player={occupants[slot.id]}
            showName={showNames}
            presentation="lineup"
          />
        ))}
      </ul>
    </div>
  )
}
