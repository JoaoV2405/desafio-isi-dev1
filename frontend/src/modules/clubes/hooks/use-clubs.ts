import { useQuery } from '@tanstack/react-query'
import { getClubs } from '../services/clubs-api'
import type { ClubsSort } from '../types/clubs-query'

export function useClubs(sort: ClubsSort = 'name') {
  return useQuery({
    queryKey: ['clubs', 'list', sort],
    queryFn: ({ signal }) => getClubs(sort, signal),
  })
}
