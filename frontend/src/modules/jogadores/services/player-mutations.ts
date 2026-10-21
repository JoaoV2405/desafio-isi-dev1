import type { CreatePlayerInput, EditPlayerInput } from '../types/player-input'
import type { Player, PlayerCondition } from '@/shared/types/player'
import { apiJson } from '@/shared/lib/api-client'
import type { BuyPlayerInput, PlayerPurchase } from '../types/player-purchase'

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
