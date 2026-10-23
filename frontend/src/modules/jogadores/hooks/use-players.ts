import { useQuery } from '@tanstack/react-query'
import type { PlayersQuery } from '../types/players-query'
import { getPlayers } from '../services/players-api'

export function usePlayers(query: PlayersQuery = {}) {
  return useQuery({
    queryKey: ['players', query],
    // O cancelamento acompanha a troca de filtros para descartar consultas que perderam a utilidade.
    queryFn: ({ signal }) => getPlayers(query, signal),
  })
}
