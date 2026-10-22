import type { SaveClubLineupInput } from '../types/club-lineup'
import type { LineupSelection } from './lineup-selection'
import type {
  FieldSlotId,
  SoccerFormation,
} from '../../../shared/components/soccer-field/types'
import type { Player } from '../../../shared/types/player'
import { FORMATION_LAYOUTS } from '../../../shared/components/soccer-field/formations.ts'
import { canOccupyFieldSlot } from '../../../shared/components/soccer-field/lineup-occupants.ts'

export interface LineupValidationErrors {
  formation?: string
  players: Partial<Record<FieldSlotId, string>>
}

type LineupValidation =
  | { valid: true; input: SaveClubLineupInput }
  | { valid: false; errors: LineupValidationErrors }

export function validateLineup(
  formation: SoccerFormation | null,
  selection: LineupSelection,
  players: Player[],
): LineupValidation {
  if (!formation) {
    return {
      valid: false,
      errors: { formation: 'Selecione uma formação.', players: {} },
    }
  }

  const errors: LineupValidationErrors = { players: {} }
  const slots = FORMATION_LAYOUTS[formation]
  const playerIds: number[] = []
  for (const slot of slots) {
    const id = selection[slot.id]
    const player = players.find((candidate) => candidate.id === id)
    if (id == null) {
      errors.players[slot.id] = 'Selecione um jogador para esta vaga.'
    } else if (!Number.isInteger(id) || id < 1 || !player) {
      errors.players[slot.id] = 'Selecione um jogador do elenco atual.'
    } else if (player.condition === 'DOENTE') {
      errors.players[slot.id] = 'Jogador doente não pode ser escalado.'
    } else if (!canOccupyFieldSlot(player, slot)) {
      errors.players[slot.id] = 'Selecione um jogador compatível com esta vaga.'
    } else if (
      slots.some((other) => other.id !== slot.id && selection[other.id] === id)
    ) {
      errors.players[slot.id] = 'Escolha um jogador diferente em cada vaga.'
    } else {
      playerIds.push(id)
    }
  }
  if (Object.keys(errors.players).length > 0) return { valid: false, errors }
  return { valid: true, input: { formation, player_ids: playerIds } }
}
