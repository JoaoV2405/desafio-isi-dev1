import { SOCCER_FIELD_GEOMETRY } from './geometry.ts'
import type {
  FieldSector,
  FieldSlot,
  FieldSlotId,
  FormationSlots,
  MatchSide,
  SoccerFormation,
} from './types'

export const SOCCER_FORMATIONS = ['3-1', '2-2', '2-1-1', '1-2-1'] as const

function slot(
  id: FieldSlotId,
  sector: FieldSector,
  x: number,
  y: number,
): FieldSlot {
  const { width, height } = SOCCER_FIELD_GEOMETRY.lineup
  return { id, sector, position: { x: x / width, y: y / height } }
}

// Authored in the original SVG coordinates, stored as proportional positions.
export const FORMATION_LAYOUTS: Readonly<
  Record<SoccerFormation, FormationSlots>
> = {
  '3-1': [
    slot('goalkeeper', 'goalkeeper', 20, 45.5),
    slot('defense-1', 'defense', 9, 36.5),
    slot('defense-2', 'defense', 20, 36.5),
    slot('defense-3', 'defense', 31, 36.5),
    slot('attack-1', 'attack', 20, 8),
  ],
  '2-2': [
    slot('goalkeeper', 'goalkeeper', 20, 45.5),
    slot('defense-1', 'defense', 13, 36.5),
    slot('defense-2', 'defense', 27, 36.5),
    slot('attack-1', 'attack', 13, 8),
    slot('attack-2', 'attack', 27, 8),
  ],
  '2-1-1': [
    slot('goalkeeper', 'goalkeeper', 20, 45.5),
    slot('defense-1', 'defense', 13, 36.5),
    slot('defense-2', 'defense', 27, 36.5),
    slot('midfield-1', 'midfield', 20, 27),
    slot('attack-1', 'attack', 20, 8),
  ],
  '1-2-1': [
    slot('goalkeeper', 'goalkeeper', 20, 45.5),
    slot('defense-1', 'defense', 20, 36.5),
    slot('midfield-1', 'midfield', 13, 27),
    slot('midfield-2', 'midfield', 27, 27),
    slot('attack-1', 'attack', 20, 8),
  ],
}

/** Rotate the lineup toward the opponent and fit it inside its playable half. */
export function getMatchFormationSlots(
  formation: SoccerFormation,
  side: MatchSide,
): FormationSlots {
  const source = SOCCER_FIELD_GEOMETRY.lineup
  const target = SOCCER_FIELD_GEOMETRY.match

  function project(original: FieldSlot): FieldSlot {
    const sourceX = original.position.x * source.width
    const sourceY = original.position.y * source.height
    const depth =
      (source.boundary.y + source.boundary.height - sourceY) /
      source.boundary.height
    const across = (sourceX - source.boundary.x) / source.boundary.width

    const x =
      (target.boundary.x +
        depth * (target.homeAttackLimit - target.boundary.x)) /
      target.width
    const y =
      (target.boundary.y + across * target.boundary.height) / target.height

    return {
      ...original,
      position: side === 'home' ? { x, y } : { x: 1 - x, y: 1 - y },
    }
  }

  // Preserve the five-slot tuple in the public contract.
  const [goalkeeper, first, second, third, fourth] =
    FORMATION_LAYOUTS[formation]
  return [
    project(goalkeeper),
    project(first),
    project(second),
    project(third),
    project(fourth),
  ]
}
