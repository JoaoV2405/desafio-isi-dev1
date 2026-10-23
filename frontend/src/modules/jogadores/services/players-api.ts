import type { PlayersQuery, PlayersResponse } from '../types/players-query'
import type { CreatePlayerInput, EditPlayerInput } from '../types/player-input'
import type { BuyPlayerInput, PlayerPurchase } from '../types/player-purchase'
import type {
  Player,
  PlayerCondition,
  PlayerDetails,
} from '@/shared/types/player'
import { apiFetch, apiJson } from '@/shared/lib/api-client'

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

export function getPlayer(
  playerId: number,
  signal?: AbortSignal,
): Promise<PlayerDetails> {
  return apiJson<PlayerDetails>(`/players/${playerId}`, { signal })
}

// Disponibiliza a operação para a integração dos modais, sem ler JSON em uma resposta 204.
export async function deletePlayer(playerId: number): Promise<void> {
  await apiFetch(`/players/${playerId}`, {
    method: 'DELETE',
  })

  // O sucesso não tem corpo; a interface deve produzir sua própria mensagem de confirmação.
}

export function buyPlayer({
  playerId,
  input,
}: {
  playerId: number
  input: BuyPlayerInput
}): Promise<PlayerPurchase> {
  return apiJson<PlayerPurchase>(`/players/${playerId}/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

// Serializa os campos numéricos já validados como números JSON.
export function createPlayer(input: CreatePlayerInput): Promise<Player> {
  return apiJson<Player>('/players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function updatePlayer({
  playerId,
  input,
}: {
  playerId: number
  input: EditPlayerInput
}): Promise<Player> {
  return apiJson<Player>(`/players/${playerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function updatePlayerCondition({
  playerId,
  condition,
}: {
  playerId: number
  condition: PlayerCondition
}): Promise<Player> {
  return apiJson<Player>(`/players/${playerId}/condition`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ condition }),
  })
}
