export type ClubsSort = 'name' | 'net_worth_asc' | 'net_worth_desc'

export interface ClubsQuery {
  sort?: ClubsSort
}
