import type { PlayersQuery, PlayersResponse } from '../types/players-query'
import { apiJson } from '@/shared/lib/api-client'

export function getPlayers(
  query: PlayersQuery = {},
  signal?: AbortSignal,
): Promise<PlayersResponse> {
  // Envia filtros, ordenação e paginação ao backend, preservando valores válidos como false e zero.
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value))
  }
  const path = params.size ? `/players?${params}` : '/players'
  return apiJson<PlayersResponse>(path, { signal })
}
