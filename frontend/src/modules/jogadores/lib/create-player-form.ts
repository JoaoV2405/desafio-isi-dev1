import type { RegisterOptions } from 'react-hook-form'
import type { PlayerFormValues } from './player-form'
import { integerRules, PLAYER_FORM_RULES } from './player-form'
import type { PlayerAttributeKey } from '@/shared/lib/player-presentation'

// O cadastro acrescenta atributos e potencial aos quatro campos compartilhados.
export interface CreatePlayerFormValues
  extends PlayerFormValues, Record<PlayerAttributeKey, number> {
  potential: number
}

// Os valores iniciais de um novo jogador pertencem somente ao fluxo de cadastro.
export function getDefaultCreatePlayerFormValues(): CreatePlayerFormValues {
  return {
    name: '',
    position: '',
    age: 18,
    agility: 50,
    pace: 50,
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defending: 50,
    physical: 50,
    potential: 75,
  }
}

// Compõe as regras compartilhadas com a validação exclusiva dos indicadores do cadastro.
export const CREATE_PLAYER_FORM_RULES = {
  ...PLAYER_FORM_RULES,
  pace: integerRules(1, 99),
  shooting: integerRules(1, 99),
  passing: integerRules(1, 99),
  dribbling: integerRules(1, 99),
  defending: integerRules(1, 99),
  physical: integerRules(1, 99),
  potential: integerRules(1, 99),
} satisfies {
  [Key in keyof CreatePlayerFormValues]: RegisterOptions<
    CreatePlayerFormValues,
    Key
  >
}
