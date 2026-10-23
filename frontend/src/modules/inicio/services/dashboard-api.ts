import { apiJson } from '@/shared/lib/api-client'

export interface DashboardSummary {
  total_players: number
  total_free_players: number
  total_clubs: number
  total_matches: number
  leader: string | null
}

export function getDashboard(signal?: AbortSignal): Promise<DashboardSummary> {
  return apiJson<DashboardSummary>('/dashboard', { signal })
}
