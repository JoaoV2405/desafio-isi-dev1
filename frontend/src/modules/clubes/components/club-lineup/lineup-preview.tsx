import { useFormContext, useWatch } from 'react-hook-form'
import type { LineupFormValues } from '../../lib/lineup-form'
import type { ClubPlayer } from '../../types/club-details'
import { LineupConditionAlert } from './lineup-condition-alert'
import { SoccerFieldBackground } from '@/shared/components/soccer-field/soccer-field-background'
import { LineupField } from '@/shared/components/soccer-field/lineup-field'

export function LineupPreview({ players }: { players: ClubPlayer[] }) {
  const { control } = useFormContext<LineupFormValues>()
  const [formation, selection] = useWatch({
    control,
    name: ['formation', 'selection'],
  })
  const selectedIds = new Set(Object.values(selection))
  const selectedPlayers = players.filter(({ id }) => selectedIds.has(id))

  return (
    <section
      aria-label="Em campo"
      className="overflow-hidden rounded-xl border bg-card"
    >
      <header className="space-y-1 border-b p-4">
        <h2 className="text-lg font-semibold">Em campo</h2>
        <p className="text-sm text-muted-foreground">
          {formation
            ? `Prévia da formação ${formation}, do goleiro ao ataque`
            : 'Prévia da formação, do goleiro ao ataque.'}
        </p>
      </header>
      <div className="space-y-3 p-4">
        {formation ? (
          <LineupField
            formation={formation}
            occupants={Object.fromEntries(
              Object.entries(selection).map(([slotId, playerId]) => [
                slotId,
                players.find(({ id }) => id === playerId) ?? null,
              ]),
            )}
          />
        ) : (
          <>
            <SoccerFieldBackground presentation="lineup" />
            <p className="text-sm text-muted-foreground">
              Escolha uma formação para visualizar os titulares no campo.
            </p>
          </>
        )}
        <LineupConditionAlert players={selectedPlayers} />
      </div>
    </section>
  )
}
