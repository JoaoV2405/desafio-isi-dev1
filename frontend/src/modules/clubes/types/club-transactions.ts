export type TransactionType = 'COMPRA' | 'VENDA'

export interface ClubTransaction {
  id: number
  club_id: number
  player_id: number
  player_name: string
  type: TransactionType
  created_at: string
  value: number
  fee: number
  penalty: number
  profit: number | null
  cash_change: number
}

export interface TransactionsSummary {
  total_spent: number
  total_received: number
  total_fees: number
  total_penalties: number
  total_profit: number
}

export interface ClubTransactionsResponse {
  data: ClubTransaction[]
  summary: TransactionsSummary
}

export interface TransactionsQuery {
  type?: TransactionType
  player_id?: number
}

export interface TransactionPlayerOption {
  id: number | null
  name: string
}
