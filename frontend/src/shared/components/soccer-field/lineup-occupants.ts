import { FORMATION_LAYOUTS } from './formations.ts'
import type {
  FieldOccupants,
  FieldPlayer,
  FieldSector,
  FieldSlot,
  SoccerFormation,
} from './types'

export const FIELD_POSITION_SECTORS: Readonly<
  Record<FieldPlayer['position'], FieldSector>
> = {
  GOL: 'goalkeeper',
  ZAG: 'defense',
  LAT: 'defense',
  MEI: 'midfield',
  ATA: 'attack',
}

export function getFieldSlotLabel(slot: FieldSlot): string {
  if (slot.sector === 'goalkeeper') return 'Goleiro'
  const labels = { defense: 'Defesa', midfield: 'Meio', attack: 'Ataque' }
  return `${labels[slot.sector]} ${slot.id.split('-').at(-1)}`
}

/** Selection helpers for forms; field renderers never filter their input. */
export function canOccupyFieldSlot(
  player: FieldPlayer,
  slot: FieldSlot,
): boolean {
  return (
    player.condition !== 'DOENTE' &&
    FIELD_POSITION_SECTORS[player.position] === slot.sector
  )
}

/** Preserve compatible selections and move surplus players into free sector slots. */
export function reconcileFieldOccupants(
  formation: SoccerFormation,
  previous: FieldOccupants,
): FieldOccupants {
  const slots = FORMATION_LAYOUTS[formation]
  const next: FieldOccupants = {}
  const used = new Set<number>()

  // Keep exact vacancies first so a missing earlier slot does not displace a
  // player whose current vacancy still exists in the new formation.
  for (const slot of slots) {
    const player = previous[slot.id]
    if (player && !used.has(player.id) && canOccupyFieldSlot(player, slot)) {
      next[slot.id] = player
      used.add(player.id)
    }
  }

  for (const slot of slots) {
    if (next[slot.id]) continue
    const player = Object.values(previous).find(
      (candidate) =>
        candidate &&
        !used.has(candidate.id) &&
        canOccupyFieldSlot(candidate, slot),
    )
    next[slot.id] = player ?? null
    if (player) used.add(player.id)
  }

  return next
}
