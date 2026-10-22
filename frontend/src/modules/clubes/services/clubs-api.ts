import type { ClubDetails } from '../types/club-details'
import type { CreateClubInput } from '../types/club-input'
import type { ClubLineup, SaveClubLineupInput } from '../types/club-lineup'
import type { PlayerSale } from '../types/player-sale'
import type { Club } from '@/shared/types/club'
import { apiJson } from '@/shared/lib/api-client'

export function createClub(input: CreateClubInput): Promise<Club> {
  return apiJson<Club>('/clubs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

// Preserva os campos e a ordem recebidos do endpoint atual, sem completar dados com fixtures.
export function getClubs(signal?: AbortSignal): Promise<Club[]> {
  return apiJson<Club[]>('/clubs', { signal })
}

export function getClub(
  clubId: string,
  signal?: AbortSignal,
): Promise<ClubDetails> {
  return apiJson<ClubDetails>(`/clubs/${encodeURIComponent(clubId)}`, {
    signal,
  })
}

// Consulta a formação, os titulares e o estado de conclusão da escalação salva.
export function getClubLineup(
  clubId: number,
  signal?: AbortSignal,
): Promise<ClubLineup> {
  return apiJson<ClubLineup>(`/clubs/${clubId}/lineup`, { signal })
}

export function saveClubLineup(
  clubId: number,
  input: SaveClubLineupInput,
): Promise<ClubLineup> {
  return apiJson<ClubLineup>(`/clubs/${clubId}/lineup`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function sellPlayer(playerId: number): Promise<PlayerSale> {
  return apiJson<PlayerSale>(`/players/${playerId}/sell`, {
    method: 'POST',
  })
}
