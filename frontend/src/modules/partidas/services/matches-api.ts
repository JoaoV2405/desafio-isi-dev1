import { apiJson } from '@/shared/lib/api-client'

export interface MatchSummary {
  id: number
  played_at: string
  home: {
    club_id: number
    club_name: string
    formation: string
    goals: number
  }
  away: MatchSummary['home']
  result: 'MANDANTE' | 'VISITANTE' | 'EMPATE'
}

export interface CreateMatchInput {
  home_club_id: number
  away_club_id: number
}

export function getMatches(signal?: AbortSignal): Promise<MatchSummary[]> {
  return apiJson<MatchSummary[]>('/matches', { signal })
}

export function createMatch(input: CreateMatchInput): Promise<MatchSummary> {
  return apiJson<MatchSummary>('/matches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}
