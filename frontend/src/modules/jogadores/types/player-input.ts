import type { Player } from '@/shared/types/player'

export type EditPlayerInput = Pick<
  Player,
  'name' | 'position' | 'age' | 'agility'
>

export interface CreatePlayerInput extends EditPlayerInput {
  pace: number
  shooting: number
  passing: number
  dribbling: number
  defending: number
  physical: number
  potential: number
}
