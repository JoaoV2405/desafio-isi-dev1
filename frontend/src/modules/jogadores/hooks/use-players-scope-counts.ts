import { usePlayers } from './use-players'
import type { PlayersQuery } from '../types/players-query'

export function usePlayersScopeCounts(
  filters: Omit<PlayersQuery, 'free' | 'page' | 'limit' | 'sort'>,
) {
  const query = { ...filters, page: 1, limit: 1 }
  const all = usePlayers(query)
  const free = usePlayers({ ...query, free: true, club_id: undefined })
  const clubs = usePlayers({ ...query, free: false })

  return {
    all: all.data?.meta.total_items,
    free: free.data?.meta.total_items,
    clubs: clubs.data?.meta.total_items,
  }
}
