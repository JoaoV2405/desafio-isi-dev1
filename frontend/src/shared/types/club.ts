export interface ClubSummary {
  id: number
  name: string
  acronym: string
}

export interface Club extends ClubSummary {
  cash: number
  squad_value?: number
  net_worth?: number
}
