export interface PlayerSale {
  id: number
  club_id: number
  player_id: number
  player_name: string
  type: 'VENDA'
  value: number
  fee: number
  penalty: number
  profit: number
  cash_change: number
  created_at: string
  purchase_value: number
  remaining_days: number
  penalty_rate: number
  contract_status: 'ENCERRADO' | 'RESCINDIDO'
  club_cash: number
}
