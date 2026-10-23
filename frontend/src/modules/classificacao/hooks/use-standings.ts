import { useQuery } from '@tanstack/react-query'
import { apiJson } from '@/shared/lib/api-client'

export interface Standings {
  position: number
  club_id: number
  club_name: string
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

export function getStandings(signal?: AbortSignal): Promise<Standings[]> {
  return apiJson<Standings[]>('/standings', { signal })
}

export function useStandings({
  refetchOnMount = true,
}: {
  refetchOnMount?: boolean | 'always'
} = {}) {
  return useQuery({
    queryKey: ['classificacao'],
    queryFn: ({ signal }) => getStandings(signal),
    refetchOnMount,
  })
}
