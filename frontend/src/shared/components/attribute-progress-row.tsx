import { cn } from '@/lib/utils'

export interface AttributeProgressRowProps {
  label: string
  value: number
  potential?: number
  className?: string
}

function clampAttribute(value: number) {
  return Number.isFinite(value) ? Math.min(99, Math.max(0, value)) : 0
}

export function AttributeProgressRow({
  label,
  value,
  potential,
  className,
}: AttributeProgressRowProps) {
  const displayedValue = clampAttribute(value)
  const displayedPotential =
    potential === undefined ? undefined : clampAttribute(potential)
  const potentialWidth = Math.max(0, (displayedPotential ?? 0) - displayedValue)

  return (
    <div
      className={cn(
        'grid grid-cols-[5rem_minmax(0,1fr)_3.5rem] items-center gap-2 text-xs',
        className,
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={99}
        aria-valuenow={displayedValue}
        aria-valuetext={
          displayedPotential === undefined
            ? `${displayedValue} de 99`
            : `${displayedValue} de 99; potencial ${displayedPotential} de 99`
        }
        className="flex h-2 overflow-hidden rounded-full bg-muted"
      >
        <span
          aria-hidden="true"
          data-slot="attribute-value"
          className="h-full shrink-0 bg-chart-1"
          style={{ width: `${(displayedValue / 99) * 100}%` }}
        />
        <span
          aria-hidden="true"
          data-slot="attribute-potential"
          className="h-full shrink-0 bg-chart-2"
          style={{ width: `${(potentialWidth / 99) * 100}%` }}
        />
      </div>
      <span
        aria-hidden="true"
        className="text-right font-semibold tabular-nums"
      >
        {displayedValue}
        {displayedPotential !== undefined && (
          <span className="font-normal text-muted-foreground">
            {' / '}
            {displayedPotential}
          </span>
        )}
      </span>
    </div>
  )
}
