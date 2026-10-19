import type {
  Player,
  PlayerCondition,
  PlayerPosition,
} from '@/shared/types/player'

export type PlayersSort =
  'name' | 'position' | 'age_asc' | 'age_desc' | 'value_asc' | 'value_desc'
export type PlayersScope = 'all' | 'free' | 'clubs'

export interface PlayersQuery {
  search?: string
  position?: PlayerPosition
  condition?: PlayerCondition
  free?: boolean
  club_id?: number
  min_age?: number
  max_age?: number
  min_value?: number
  max_value?: number
  sort?: PlayersSort
  page?: number
  limit?: number
}

export interface PlayersResponse {
  data: Player[]
  meta: {
    page: number
    limit: number
    total_items: number
    total_pages: number
  }
}

export interface PlayersFilterValues {
  search: string
  position: PlayerPosition | ''
  condition: PlayerCondition | ''
  clubId: string
  minAge: string
  maxAge: string
  minValue: string
  maxValue: string
}

export const DEFAULT_PLAYER_FILTERS: PlayersFilterValues = {
  search: '',
  position: '',
  condition: '',
  clubId: '',
  minAge: '',
  maxAge: '',
  minValue: '',
  maxValue: '',
}
