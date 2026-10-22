import type {
  FieldOccupants,
  FieldSlot,
  FieldSlotId,
  SoccerFormation,
} from '@/shared/components/soccer-field/types'
import type { Player } from '@/shared/types/player'
import { FORMATION_LAYOUTS } from '../../../shared/components/soccer-field/formations.ts'
import {
  canOccupyFieldSlot,
  FIELD_POSITION_SECTORS,
  reconcileFieldOccupants,
} from '../../../shared/components/soccer-field/lineup-occupants.ts'

export type LineupSelection = Partial<Record<FieldSlotId, number | null>>
export type LineupAttribute = 'defending' | 'shooting' | 'passing' | 'dribbling'

export function createLineupSelection(
  formation: SoccerFormation,
  players: Player[],
): LineupSelection {
  const selection: LineupSelection = {}
  const used = new Set<number>()
  for (const slot of FORMATION_LAYOUTS[formation]) {
    const player = players.find(
      (candidate) =>
        !used.has(candidate.id) && canOccupyFieldSlot(candidate, slot),
    )
    selection[slot.id] = player?.id ?? null
    if (player) used.add(player.id)
  }
  return selection
}

export function reconcileLineupSelection(
  formation: SoccerFormation,
  selection: LineupSelection,
  players: Player[],
): LineupSelection {
  const occupants: FieldOccupants = {}
  for (const [slotId, playerId] of Object.entries(selection)) {
    occupants[slotId as FieldSlotId] =
      players.find((player) => player.id === playerId) ?? null
  }
  return Object.fromEntries(
    Object.entries(reconcileFieldOccupants(formation, occupants)).map(
      ([slotId, player]) => [slotId, player?.id ?? null],
    ),
  )
}

export function getLineupPlayerOptions<T extends Player>(
  slot: FieldSlot,
  selection: LineupSelection,
  players: T[],
): T[] {
  const usedElsewhere = new Set(
    Object.entries(selection)
      .filter(([slotId]) => slotId !== slot.id)
      .map(([, playerId]) => playerId),
  )
  return players.filter(
    (player) =>
      canOccupyFieldSlot(player, slot) && !usedElsewhere.has(player.id),
  )
}

export function getLineupAttributes(
  formation: SoccerFormation,
  selection: LineupSelection,
  players: Player[],
  player: Player,
): LineupAttribute[] {
  if (player.position === 'GOL') return ['defending']

  const sector = FIELD_POSITION_SECTORS[player.position]
  const selectedIds = new Set(Object.values(selection))
  // O elenco já vem ordenado pela API. A ordem dos cliques não define os duelos.
  const sectorPlayers = players.filter(
    (candidate) =>
      selectedIds.has(candidate.id) &&
      FIELD_POSITION_SECTORS[candidate.position] === sector,
  )
  const sectorOffset =
    FORMATION_LAYOUTS[formation].findIndex((slot) => slot.sector === sector) - 1
  const lineIndex =
    sectorOffset + sectorPlayers.findIndex(({ id }) => id === player.id)
  const attackAttribute = {
    ZAG: 'dribbling',
    LAT: 'dribbling',
    MEI: 'passing',
    ATA: 'shooting',
  } as const

  if (lineIndex === 0) return ['defending']
  if (lineIndex === 1) return ['defending', attackAttribute[player.position]]
  return [attackAttribute[player.position]]
}
