import { useFormContext, useWatch } from 'react-hook-form'
import type { LineupFormValues } from '../../lib/lineup-form'
import type { ClubPlayer } from '../../types/club-details'

export function LineupSelectionCount({ players }: { players: ClubPlayer[] }) {
  const { control } = useFormContext<LineupFormValues>()
  const selection = useWatch({ control, name: 'selection' })
  const selectedIds = new Set(Object.values(selection))
  const count = players.filter(({ id }) => selectedIds.has(id)).length

  return (
    <p className="text-sm text-muted-foreground" role="status">
      {count} de 5 vagas preenchidas
    </p>
  )
}
