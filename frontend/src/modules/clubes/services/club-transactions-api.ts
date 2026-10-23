import type {
  ClubTransactionsResponse,
  TransactionPlayerOption,
  TransactionsQuery,
} from '../types/club-transactions'
import { getPlayers } from '@/modules/jogadores/services/players-api'
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

export async function getTransactionPlayers(
  signal?: AbortSignal,
): Promise<TransactionPlayerOption[]> {
  const players: TransactionPlayerOption[] = []
  // O combobox inclui todos os jogadores, mesmo os que não têm operações no clube.
  let page = 1
  let totalPages = 1
  do {
    const response = await getPlayers({ page, limit: 50, sort: 'name' }, signal)
    players.push(...response.data.map(({ id, name }) => ({ id, name })))
    totalPages = response.meta.total_pages
    page += 1
  } while (page <= totalPages)
  return players
}
