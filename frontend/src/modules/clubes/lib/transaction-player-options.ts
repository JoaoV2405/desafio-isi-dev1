import type {
  ClubTransaction,
  TransactionPlayerOption,
} from '../types/club-transactions'

export function getTransactionPlayerOptions(
  transactions: readonly ClubTransaction[],
): TransactionPlayerOption[] {
  const players = new Map<number, TransactionPlayerOption>()
  // O histórico vem do mais recente para o mais antigo; mantém o último nome registrado.
  for (const transaction of transactions) {
    if (!players.has(transaction.player_id)) {
      players.set(transaction.player_id, {
        id: transaction.player_id,
        name: transaction.player_name,
      })
    }
  }
  return [
    { id: null, name: 'Todos' },
    ...Array.from(players.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR'),
    ),
  ]
}
