import { useId } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import type { PlayerFormRules, PlayerFormValues } from '../lib/player-form'
import { PLAYER_FORM_RULES } from '../lib/player-form'
import type { PlayerPosition } from '@/shared/types/player'
import { cn } from '@/lib/utils'
import { PLAYER_POSITIONS } from '@/shared/types/player'

interface PlayerPositionSelectorProps {
  rules?: PlayerFormRules['position']
  lockedPosition?: PlayerPosition
}

export function PlayerPositionSelector({
  rules = PLAYER_FORM_RULES.position,
  lockedPosition,
}: PlayerPositionSelectorProps) {
  const id = useId()
  const errorId = `${id}-error`
  const descriptionId = `${id}-description`
  // Usa o contrato comum para registrar e destacar a posição em cadastro e edição.
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<PlayerFormValues>()
  const value = useWatch({ control, name: 'position' })
  const error = errors.position?.message
  const describedBy = [
    lockedPosition ? descriptionId : '',
    error ? errorId : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <fieldset className="min-w-0 space-y-1.5">
      <legend className="mb-1.5 text-sm font-medium">Posição</legend>
      <div className="grid grid-cols-5 gap-2">
        {(Object.entries(PLAYER_POSITIONS) as [PlayerPosition, string][]).map(
          ([position, label]) => (
            <label
              key={position}
              className={cn(
                'flex min-w-0 cursor-pointer flex-col items-center gap-1 rounded-lg border bg-background px-1 py-3 text-center transition-colors hover:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
                value === position &&
                  'border-blue-500 bg-blue-50 hover:bg-blue-50',
                error && 'border-destructive',
                // Mantém a opção atual habilitada e sinaliza visualmente as alternativas bloqueadas.
                lockedPosition &&
                  lockedPosition !== position &&
                  'cursor-not-allowed opacity-50 hover:bg-background',
              )}
            >
              <input
                {...register('position', rules)}
                type="radio"
                value={position}
                required
                disabled={Boolean(
                  lockedPosition && lockedPosition !== position,
                )}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy || undefined}
                className="sr-only"
              />
              <span className="text-sm font-bold">{position}</span>
              <span className="text-[11px] text-muted-foreground sm:text-xs">
                {label}
              </span>
            </label>
          ),
        )}
      </div>
      {lockedPosition && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          A posição não pode mudar enquanto o jogador estiver vinculado a um
          clube.
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  )
}
