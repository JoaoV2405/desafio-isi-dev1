import type { FieldErrors, Resolver } from 'react-hook-form'
import type { ClubLineup, SaveClubLineupInput } from '../types/club-lineup'
import type { LineupSelection } from './lineup-selection'
import { createLineupSelection } from './lineup-selection'
import { validateLineup } from './lineup-validation'
import type { SoccerFormation } from '@/shared/components/soccer-field/types'
import type { Player } from '@/shared/types/player'

export interface LineupFormValues {
  formation: SoccerFormation | null
  selection: LineupSelection
}

export function getLineupFormValues(
  lineup: ClubLineup | undefined,
  players: Player[],
): LineupFormValues {
  const formation = lineup?.formation ?? null
  const savedIds = new Set(lineup?.players.map(({ id }) => id))
  return {
    formation,
    selection: formation
      ? createLineupSelection(
          formation,
          players.filter(({ id }) => savedIds.has(id)),
        )
      : {},
  }
}

export const lineupFormResolver: Resolver<
  LineupFormValues,
  Player[],
  SaveClubLineupInput
> = ({ formation, selection }, players = []) => {
  const result = validateLineup(formation, selection, players)
  if (result.valid) return { values: result.input, errors: {} }

  const errors: FieldErrors<LineupFormValues> = {}
  if (result.errors.formation) {
    errors.formation = { type: 'validate', message: result.errors.formation }
  }
  if (Object.keys(result.errors.players).length > 0) {
    errors.selection = Object.fromEntries(
      Object.entries(result.errors.players).map(([slotId, message]) => [
        slotId,
        { type: 'validate', message },
      ]),
    )
  }
  return { values: {}, errors }
}
