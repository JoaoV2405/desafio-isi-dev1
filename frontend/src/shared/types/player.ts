export const PLAYER_POSITIONS = {
  GOL: 'Goleiro',
  ZAG: 'Zagueiro',
  LAT: 'Lateral',
  MEI: 'Meia',
  ATA: 'Atacante',
} as const

export type PlayerPosition = keyof typeof PLAYER_POSITIONS

export const PLAYER_CONDITIONS = {
  APTO: 'Apto',
  MAL_CONDICIONADO: 'Mal condicionado',
  DOENTE: 'Doente',
} as const

export type PlayerCondition = keyof typeof PLAYER_CONDITIONS

export interface Player {
  id: number
  name: string
  position: PlayerPosition
  overall: number
  agility: number
  age: number
  condition: PlayerCondition
  base_value: number
  market_value: number
  club_id: number | null
}
