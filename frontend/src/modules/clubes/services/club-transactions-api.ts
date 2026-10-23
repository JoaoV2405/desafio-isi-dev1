import type {
  ClubTransactionsResponse,
  TransactionsQuery,
} from '../types/club-transactions'
import { apiFetch, apiJson } from '@/shared/lib/api-client'

function transactionsPath(
  clubId: number,
  query: TransactionsQuery,
  exporting = false,
) {
  const params = new URLSearchParams()
  if (query.type) params.set('type', query.type)
  if (query.player_id !== undefined)
    params.set('player_id', String(query.player_id))
  const path = `/clubs/${clubId}/transactions${exporting ? '/export' : ''}`
  return params.size ? `${path}?${params}` : path
}

export function getClubTransactions(
  clubId: number,
  query: TransactionsQuery = {},
  signal?: AbortSignal,
): Promise<ClubTransactionsResponse> {
  return apiJson(transactionsPath(clubId, query), { signal })
}

export async function exportClubTransactions(
  clubId: number,
  query: TransactionsQuery,
): Promise<Blob> {
  const response = await apiFetch(transactionsPath(clubId, query, true), {
    headers: { Accept: 'text/csv' },
  })
  if (!response.headers.get('Content-Type')?.includes('text/csv')) {
    throw new Error('A API não retornou um arquivo CSV válido.')
  }
  return response.blob()
}
