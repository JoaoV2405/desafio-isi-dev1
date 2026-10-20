import type { PlayerDetails } from '@/shared/types/player'
import { apiJson } from '@/shared/lib/api-client'

export function getPlayer(
  playerId: number,
  signal?: AbortSignal,
): Promise<PlayerDetails> {
  return apiJson<PlayerDetails>(`/players/${playerId}`, { signal })
}
