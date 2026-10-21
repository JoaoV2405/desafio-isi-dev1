import type { ClubDetails } from '../types/club-details'
import type { CreateClubInput } from '../types/club-input'
import type { Club } from '@/shared/types/club'
import type { Player } from '@/shared/types/player'
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

// Consulta os titulares para avisar sobre a remoção de um jogador ao alterar sua condição.
export function getClubLineup(
  clubId: number,
  signal?: AbortSignal,
): Promise<{ club_id: number; players: Player[] }> {
  return apiJson(`/clubs/${clubId}/lineup`, { signal })
}
