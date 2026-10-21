import { useQuery } from '@tanstack/react-query'
import { getClubLineup } from '../services/clubs-api'

export function useClubLineup(clubId: number, enabled = true) {
  return useQuery({
    queryKey: ['clubs', 'lineup', clubId],
    queryFn: ({ signal }) => getClubLineup(clubId, signal),
    enabled,
    staleTime: 0,
    retry: false,
  })
}
