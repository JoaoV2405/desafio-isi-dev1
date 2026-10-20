import type { PlayerFormRules, PlayerFormValues } from './player-form'
import { PLAYER_FORM_RULES } from './player-form'
import type { Player } from '@/shared/types/player'

// Preenche somente os quatro campos editáveis com os dados atuais do jogador.
export function getEditPlayerFormValues(player: Player): PlayerFormValues {
  return {
    name: player.name,
    position: player.position,
    age: player.age,
    agility: player.agility,
  }
}

// Mantém as validações comuns e acrescenta as restrições específicas da edição.
export function getEditPlayerFormRules(player: Player): PlayerFormRules {
  return {
    ...PLAYER_FORM_RULES,
    position: {
      validate: (value) => {
        const result = PLAYER_FORM_RULES.position.validate(value)
        if (result !== true) return result
        return (
          player.club_id === null ||
          value === player.position ||
          'A posição não pode mudar enquanto o jogador estiver vinculado a um clube.'
        )
      },
    },
    age: {
      // Preserva a conversão numérica ao acrescentar a restrição de idade da edição.
      ...PLAYER_FORM_RULES.age,
      validate: (value) => {
        const result = PLAYER_FORM_RULES.age.validate(value)
        if (result !== true) return result
        return (
          value >= player.age ||
          `A idade não pode ser menor que a idade atual (${player.age} anos).`
        )
      },
    },
  }
}
