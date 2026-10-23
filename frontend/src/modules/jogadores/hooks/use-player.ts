import { useQuery } from '@tanstack/react-query'
import { getPlayer } from '../services/players-api'

export function usePlayer(playerId: number, enabled = true) {
  return useQuery({
    queryKey: ['players', 'detail', playerId],
    // Carrega os atributos apenas ao abrir os detalhes e cancela consultas sem mais consumidores.
    queryFn: ({ signal }) => getPlayer(playerId, signal),
    enabled,
  })
}
