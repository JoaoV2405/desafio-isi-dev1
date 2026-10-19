import { useFormContext } from 'react-hook-form'
import type { CreatePlayerFormValues } from '../lib/create-player-form'
import {
  CREATE_PLAYER_FORM_RULES,
  PLAYER_ATTRIBUTE_FIELDS,
} from '../lib/create-player-form'
import { PlayerFormField } from './player-form-field'

const technicalFields = [
  ...PLAYER_ATTRIBUTE_FIELDS,
  { key: 'potential', label: 'Potencial' } as const,
]

export function PlayerTechnicalFields() {
  // Registra atributos e potencial no mesmo formulário, com erros individuais de 1 a 99.
  const {
    register,
    formState: { errors },
  } = useFormContext<CreatePlayerFormValues>()
  return (
    <div className="grid min-w-0 grid-cols-2 content-start gap-x-4 gap-y-5 sm:grid-cols-4">
      {technicalFields.map(({ key, label }) => (
        <PlayerFormField
          key={key}
          {...register(key, CREATE_PLAYER_FORM_RULES[key])}
          label={label}
          type="number"
          min={1}
          max={99}
          step={1}
          required
          description={
            key === 'potential'
              ? 'Limite de evolução dos atributos.'
              : undefined
          }
          error={errors[key]?.message}
        />
      ))}
      <PlayerFormField
        label="Overall"
        value="Após salvar"
        disabled
        description="Calculado após salvar."
      />
    </div>
  )
}
