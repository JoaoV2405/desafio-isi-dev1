import { useQuery } from '@tanstack/react-query'
import { getMatches } from '../services/matches-api'

export function useMatches() {
  return useQuery({
    queryKey: ['matches', 'list'],
    queryFn: ({ signal }) => getMatches(signal),
  })
}
