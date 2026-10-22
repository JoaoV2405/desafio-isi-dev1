import type { SoccerFormation } from '@/shared/components/soccer-field/types'
import type { Player } from '@/shared/types/player'

export interface ClubLineup {
  club_id: number
  formation: SoccerFormation | null
  complete: boolean
  players: Player[]
}

export interface SaveClubLineupInput {
  formation: SoccerFormation
  player_ids: number[]
}
