import type { Club } from '@/shared/types/club'
import fixtures from './clubs.json'

const clubs: Club[] = fixtures
const nameCollator = new Intl.Collator('pt-BR', { sensitivity: 'base' })

// Espelha a ordenação fixa por nome do endpoint atual, com desempate pelo identificador.
export function getMockClubs(): Club[] {
  return [...clubs].sort((left, right) => {
    return nameCollator.compare(left.name, right.name) || left.id - right.id
  })
}
