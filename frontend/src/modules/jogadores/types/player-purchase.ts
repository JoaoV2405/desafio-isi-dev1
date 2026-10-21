export interface BuyPlayerInput {
  club_id: number
  loyalty_until: string
}

export interface PlayerPurchase {
  club_id: number
  player_id: number
  player_name: string
  value: number
  fee: number
  club_cash: number
  contract: {
    purchase_value: number
    loyalty_until: string
    status: 'ATIVO'
  }
}
