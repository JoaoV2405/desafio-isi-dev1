import { useId } from 'react'
import type { Ref } from 'react'
import formation31 from '@/assets/Formação=3-1.svg'
import formation22 from '@/assets/Formação=2-2.svg'
import formation211 from '@/assets/Formação=2-1-1.svg'
import formation121 from '@/assets/Formação=1-2-1.svg'
import type { SoccerFormation } from '@/shared/components/soccer-field/types'
import { SOCCER_FORMATIONS } from '@/shared/components/soccer-field/formations'
import { cn } from '@/lib/utils'

const formationOptions = {
  '3-1': {
    icon: formation31,
    description: 'Três na defesa e um no ataque',
  },
  '2-2': {
    icon: formation22,
    description: 'Dois na defesa e dois no ataque',
  },
  '2-1-1': {
    icon: formation211,
    description: 'Dois na defesa, um no meio e um no ataque',
  },
  '1-2-1': {
    icon: formation121,
    description: 'Um na defesa, dois no meio e um no ataque',
  },
} satisfies Record<SoccerFormation, { icon: string; description: string }>

interface FormationSelectorProps {
  value: SoccerFormation | null
  onValueChange: (formation: SoccerFormation) => void
  disabled?: boolean
  error?: string
  inputRef?: Ref<HTMLInputElement>
  onBlur?: () => void
}

export function FormationSelector({
  value,
  onValueChange,
  disabled = false,
  error,
  inputRef,
  onBlur,
}: FormationSelectorProps) {
  const id = useId()

  return (
    <fieldset
      role="radiogroup"
      disabled={disabled}
      aria-describedby={`${id}-description${error ? ` ${id}-error` : ''}`}
      aria-invalid={Boolean(error)}
      className="min-w-0 space-y-3 border-b p-4"
    >
      <legend className="sr-only">Formação</legend>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold" aria-hidden="true">
          Formação
        </h3>
        <p id={`${id}-description`} className="text-sm text-muted-foreground">
          Defina a distribuição dos jogadores entre defesa, meio e ataque.
        </p>
      </div>
      <div className="-m-1 overflow-x-auto p-1">
        <div className="grid min-w-140 grid-cols-4 gap-2">
          {SOCCER_FORMATIONS.map((formation) => (
            <label
              key={formation}
              className={cn(
                'flex min-w-0 cursor-pointer items-start gap-2 rounded-lg border border-input bg-background p-3 transition-colors hover:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-ring',
                value === formation &&
                  'border-primary bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft',
                disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <img
                src={formationOptions[formation].icon}
                alt=""
                width={28}
                height={36}
                className="h-9 w-7 shrink-0"
              />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="flex items-center gap-2">
                  <input
                    ref={
                      formation === SOCCER_FORMATIONS[0] ? inputRef : undefined
                    }
                    type="radio"
                    name={id}
                    value={formation}
                    checked={value === formation}
                    onChange={() => onValueChange(formation)}
                    onBlur={onBlur}
                    aria-labelledby={`${id}-${formation}-name`}
                    aria-describedby={`${id}-${formation}-description${error ? ` ${id}-error` : ''}`}
                    aria-invalid={Boolean(error)}
                    className="size-4 shrink-0 accent-primary"
                  />
                  <span
                    id={`${id}-${formation}-name`}
                    className="text-sm font-semibold whitespace-nowrap"
                  >
                    {formation}
                  </span>
                </span>
                <span
                  id={`${id}-${formation}-description`}
                  className="text-xs text-muted-foreground"
                >
                  {formationOptions[formation].description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  )
}
