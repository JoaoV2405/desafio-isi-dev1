import type { RegisterOptions } from 'react-hook-form'
import type { PlayerPosition } from '@/shared/types/player'
import { PLAYER_POSITIONS } from '@/shared/types/player'

// Define somente os campos editáveis compartilhados entre cadastro e edição.
export interface PlayerFormValues {
  name: string
  position: PlayerPosition | ''
  age: number
  agility: number
}

// Permite que cada fluxo acrescente suas restrições aos campos compartilhados.
export type PlayerFormRules = {
  [Key in keyof PlayerFormValues]: RegisterOptions<PlayerFormValues, Key>
}

// Converte os inputs para números antes da validação e do envio; campos vazios viram NaN e são recusados.
export function integerRules(min: number, max: number) {
  return {
    valueAsNumber: true as const,
    validate: (value: number) => {
      return (
        (Number.isInteger(value) && value >= min && value <= max) ||
        `Informe um número inteiro de ${min} a ${max}.`
      )
    },
  }
}

// Cadastro e edição aplicam as mesmas regras sem depender dos atributos exclusivos do cadastro.
export const PLAYER_FORM_RULES = {
  name: {
    validate: (value) =>
      (value.trim().length >= 3 && value.trim().length <= 100) ||
      'Informe um nome de 3 a 100 caracteres.',
  },
  position: {
    validate: (value) =>
      Object.hasOwn(PLAYER_POSITIONS, value) || 'Selecione uma posição.',
  },
  age: integerRules(16, 45),
  agility: integerRules(1, 100),
} satisfies PlayerFormRules
