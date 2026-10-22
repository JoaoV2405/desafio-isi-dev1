import { useQuery } from '@tanstack/react-query'
import type { TransactionsQuery } from '../types/club-transactions'
import {
  getClubTransactions,
  getTransactionPlayers,
} from '../services/club-transactions-api'

export function useClubTransactions(
  clubId: number,
  query: TransactionsQuery = {},
) {
  return useQuery({
    // Compra e venda já invalidam todas as consultas sob a chave clubs.
    queryKey: ['clubs', 'transactions', clubId, query],
    queryFn: ({ signal }) => getClubTransactions(clubId, query, signal),
  })
}

export function useTransactionPlayers() {
  return useQuery({
    queryKey: ['players', 'transaction-options'],
    queryFn: ({ signal }) => getTransactionPlayers(signal),
  })
}
