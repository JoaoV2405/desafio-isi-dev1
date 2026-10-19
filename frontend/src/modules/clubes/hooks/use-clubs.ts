import { useQuery } from '@tanstack/react-query'
import type { ClubsQuery } from '../types/clubs-query'
import { getMockClubs } from '../data/mock-clubs'

export function useClubs(query: ClubsQuery = {}) {
  return useQuery({
    queryKey: ['clubs', query],
    // TODO: substituir pela consulta GET /clubs?sort=... ao ativar a integração.
    queryFn: () => getMockClubs(query),
  })
}
