import { apiJson } from '@/shared/lib/api-client'
import type { PlayerCondition, PlayerPosition } from '@/shared/types/player'
import type { SoccerFormation } from '@/shared/components/soccer-field/types'

export interface MatchSummary {
  id: number
  played_at: string
  home: {
    club_id: number
    club_name: string
    formation: SoccerFormation
    goals: number
  }
  away: MatchSummary['home']
  result: 'MANDANTE' | 'VISITANTE' | 'EMPATE'
}

export interface CreateMatchInput {
  home_club_id: number
  away_club_id: number
}

export interface DuelParticipant {
  player_id: number
  player_name: string
  position: PlayerPosition
  condition: Exclude<PlayerCondition, 'DOENTE'>
  attribute: 'shooting' | 'passing' | 'dribbling' | 'defending'
  value: number
}

export interface MatchDuel {
  order: 1 | 2 | 3 | 4 | 5 | 6
  attacking_club_id: number
  attacker: DuelParticipant
  defender: DuelParticipant
  goal: boolean
}

export interface MatchDetail extends MatchSummary {
  duels: MatchDuel[]
}

export function getMatch(
  id: string,
  signal?: AbortSignal,
): Promise<MatchDetail> {
  return apiJson<MatchDetail>(`/matches/${encodeURIComponent(id)}`, { signal })
}

export function getMatches(
  signal?: AbortSignal,
  clubId: number | null = null,
): Promise<MatchSummary[]> {
  const query = clubId === null ? '' : `?club_id=${clubId}`
  return apiJson<MatchSummary[]>(`/matches${query}`, { signal })
}

export function createMatch(input: CreateMatchInput): Promise<MatchDetail> {
  return apiJson<MatchDetail>('/matches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}
