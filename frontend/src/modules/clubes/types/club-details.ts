import type { Club } from '@/shared/types/club'
import type { Player } from '@/shared/types/player'

export interface ClubPlayerContract {
  purchase_value: number
  loyalty_until: string
  remaining_days: number
  penalty_rate: number
}

export interface ClubPlayer extends Player {
  contract: ClubPlayerContract
}

export interface ClubDetails extends Club {
  // Ausência significa elenco não informado; um array vazio significa elenco sem jogadores.
  players?: ClubPlayer[]
}

