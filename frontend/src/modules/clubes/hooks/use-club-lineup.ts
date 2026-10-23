import { useQuery } from '@tanstack/react-query'
import { getClubLineup } from '../services/clubs-api'

export function useClubLineup(clubId: number | null, enabled = true) {
  return useQuery({
    queryKey: ['clubs', 'lineup', clubId],
    queryFn: ({ signal }) => {
      if (clubId === null) throw new Error('Clube não informado.')
      return getClubLineup(clubId, signal)
    },
    enabled: enabled && clubId !== null,
    staleTime: 0,
    retry: false,
  })
}
