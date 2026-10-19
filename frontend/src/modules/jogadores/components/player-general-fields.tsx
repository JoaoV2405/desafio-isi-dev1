import { useFormContext } from 'react-hook-form'
import type { ReactNode } from 'react'
import type { PlayerFormRules, PlayerFormValues } from '../lib/player-form'
import type { PlayerPosition } from '@/shared/types/player'
import { PLAYER_FORM_RULES } from '../lib/player-form'
import { PlayerFormField } from './player-form-field'
import { PlayerPositionSelector } from './player-position-selector'

interface PlayerGeneralFieldsProps {
  children?: ReactNode
  rules?: PlayerFormRules
  minAge?: number
  lockedPosition?: PlayerPosition
}

export function PlayerGeneralFields({
  children,
  rules = PLAYER_FORM_RULES,
  minAge = 16,
  lockedPosition,
}: PlayerGeneralFieldsProps) {
  // Usa somente o contrato comum para funcionar tanto no formulário de cadastro quanto no de edição.
  const {
    register,
    formState: { errors },
  } = useFormContext<PlayerFormValues>()
  return (
    <section aria-label="Dados gerais do jogador" className="space-y-5">
      <PlayerFormField
        {...register('name', rules.name)}
        label="Nome"
        placeholder="Nome do jogador"
        autoComplete="off"
        required
        minLength={3}
        maxLength={100}
        description="Nome completo do jogador, de 3 a 100 caracteres."
        error={errors.name?.message}
      />
      {/* O fluxo informa suas restrições sem acoplar os campos comuns à edição. */}
      <PlayerPositionSelector
        rules={rules.position}
        lockedPosition={lockedPosition}
      />
      {/* Permite ao modal acrescentar um campo próprio sem acoplar os campos comuns ao cadastro. */}
      <div
        className={
          children ? 'grid gap-4 sm:grid-cols-3' : 'grid gap-4 sm:grid-cols-2'
        }
      >
        <PlayerFormField
          {...register('age', rules.age)}
          label="Idade"
          type="number"
          min={minAge}
          max={45}
          step={1}
          required
          description={`Entre ${minAge} e 45 anos.`}
          error={errors.age?.message}
        />
        <PlayerFormField
          {...register('agility', rules.agility)}
          label="Agilidade"
          type="number"
          min={1}
          max={100}
          step={1}
          required
          description="De 1 a 100."
          error={errors.agility?.message}
        />
        {children}
      </div>
    </section>
  )
}
