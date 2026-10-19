import type { PlayersQuery, PlayersResponse } from '../types/players-query'
import type { Player } from '@/shared/types/player'
import type { ClubSummary } from '@/shared/types/club'
import fixtures from './players.json'
import { PLAYER_POSITIONS } from '@/shared/types/player'

const players = fixtures.players as Player[]
export const mockClubs: ClubSummary[] = fixtures.clubs
const nameCollator = new Intl.Collator('pt-BR', { sensitivity: 'base' })

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR')
}

export function getMockPlayers(query: PlayersQuery = {}): PlayersResponse {
  const search = normalizeSearch(query.search?.trim() ?? '')
  const filtered = players.filter(
    (player) =>
      (!search || normalizeSearch(player.name).includes(search)) &&
      (!query.position || player.position === query.position) &&
      (!query.condition || player.condition === query.condition) &&
      (query.free === undefined || (player.club_id === null) === query.free) &&
      (query.club_id === undefined || player.club_id === query.club_id) &&
      (query.min_age === undefined || player.age >= query.min_age) &&
      (query.max_age === undefined || player.age <= query.max_age) &&
      (query.min_value === undefined ||
        player.market_value >= query.min_value) &&
      (query.max_value === undefined || player.market_value <= query.max_value),
  )
  const positions = Object.keys(PLAYER_POSITIONS)
  filtered.sort((left, right) => {
    let order = 0
    switch (query.sort ?? 'name') {
      case 'name':
        order = nameCollator.compare(left.name, right.name)
        break
      case 'position':
        order =
          positions.indexOf(left.position) - positions.indexOf(right.position)
        break
      case 'age_asc':
        order = left.age - right.age
        break
      case 'age_desc':
        order = right.age - left.age
        break
      case 'value_asc':
        order = left.market_value - right.market_value
        break
      case 'value_desc':
        order = right.market_value - left.market_value
        break
    }
    return (
      order || nameCollator.compare(left.name, right.name) || left.id - right.id
    )
  })
  const page = query.page ?? 1
  const limit = query.limit ?? 10

  return {
    data: filtered.slice((page - 1) * limit, page * limit),
    meta: {
      page,
      limit,
      total_items: filtered.length,
      total_pages: Math.ceil(filtered.length / limit),
    },
  }
}
