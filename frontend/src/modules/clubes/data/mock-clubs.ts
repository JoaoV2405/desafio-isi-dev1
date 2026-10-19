import type { ClubsQuery } from '../types/clubs-query'
import type { Club } from '@/shared/types/club'
import fixtures from './clubs.json'

const clubs: Club[] = fixtures
const nameCollator = new Intl.Collator('pt-BR', { sensitivity: 'base' })

export function getMockClubs(query: ClubsQuery = {}): Club[] {
  return [...clubs].sort((left, right) => {
    let order = 0
    switch (query.sort ?? 'name') {
      case 'name':
        order = nameCollator.compare(left.name, right.name)
        break
      case 'net_worth_asc':
        order = left.net_worth - right.net_worth
        break
      case 'net_worth_desc':
        order = right.net_worth - left.net_worth
        break
    }
    return (
      order || nameCollator.compare(left.name, right.name) || left.id - right.id
    )
  })
}
