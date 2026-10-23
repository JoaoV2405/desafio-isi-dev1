import type { ClubSummary } from '@/shared/types/club'
import type { Player } from '@/shared/types/player'

export type SoccerFormation = '3-1' | '2-2' | '2-1-1' | '1-2-1'
export type FieldPresentation = 'lineup' | 'match'
export type MatchSide = 'home' | 'away'
export type FieldSector = 'goalkeeper' | 'defense' | 'midfield' | 'attack'

// Numbered from left to right in the original lineup view, within each sector.
// IDs identify vacancies within a formation, not players or selection priority.
export type FieldSlotId =
  | 'goalkeeper'
  | `defense-${1 | 2 | 3}`
  | `midfield-${1 | 2}`
  | `attack-${1 | 2}`

/** Coordinates relative to the entire background: 0 to 1 on both axes. */
export interface FieldPoint {
  readonly x: number
  readonly y: number
}

export interface FieldSlot {
  readonly id: FieldSlotId
  readonly sector: FieldSector
  readonly position: FieldPoint
}

export type FormationSlots = readonly [
  FieldSlot,
  FieldSlot,
  FieldSlot,
  FieldSlot,
  FieldSlot,
]

export type FieldPlayer = Pick<Player, 'id' | 'name' | 'position'> &
  Partial<Pick<Player, 'condition'>> & { scored?: boolean }

/** A missing entry or null means that the formation's vacancy is empty. */
export type FieldOccupants = Partial<Record<FieldSlotId, FieldPlayer | null>>

export interface FieldTeam extends Pick<ClubSummary, 'id' | 'name'> {
  acronym?: ClubSummary['acronym']
  formation: SoccerFormation
  occupants: FieldOccupants
}
