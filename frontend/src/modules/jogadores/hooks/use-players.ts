import { useQuery } from '@tanstack/react-query'
import type { PlayersQuery } from '../types/players-query'
import { getMockPlayers } from '../data/mock-players'

export function usePlayers(query: PlayersQuery = {}) {
  return useQuery({
    queryKey: ['players', query],
    queryFn: () => getMockPlayers(query),
    // Integração real: substituir a queryFn acima pela operação abaixo.
    // queryFn: async ({ signal }): Promise<PlayersResponse> => {
    //   const params = new URLSearchParams()
    //   for (const [key, value] of Object.entries(query)) {
    //     if (value !== undefined) params.set(key, String(value))
    //   }
    //   const origin = import.meta.env.VITE_API_ORIGIN ?? ''
    //   const response = await fetch(`${origin}/api/v1/players?${params}`, { signal })
    //   const body = await response.json()
    //   if (!response.ok) throw new Error(body.message ?? 'Não foi possível carregar os jogadores.')
    //   return body
    // },
    // Ao ativar, importar também PlayersResponse de ../types/players-query.
  })
}
