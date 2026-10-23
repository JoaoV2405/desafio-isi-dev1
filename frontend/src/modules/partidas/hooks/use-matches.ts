import { useQuery } from '@tanstack/react-query'
import { getMatches } from '../services/matches-api'

export function useMatches(clubId: number | null = null) {
  return useQuery({
    queryKey:
      clubId === null ? ['matches', 'list'] : ['matches', 'list', { clubId }],
    queryFn: ({ signal }) => getMatches(signal, clubId),
  })
}
