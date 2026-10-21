import type { ReactNode } from 'react'
import { IconPlaceholder } from '@/components/layout/icon-placeholder'

interface ClubSummaryCardProps {
  title: string
  value: ReactNode
  unit?: string
  description: string
  icon?: ReactNode
}

export function ClubSummaryCard({
  title,
  value,
  unit,
  description,
  icon = <IconPlaceholder />,
}: ClubSummaryCardProps) {
  return (
    <article className="min-w-0 space-y-3 rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base leading-6 font-semibold">{title}</h2>
        <span aria-hidden="true" className="shrink-0 text-muted-foreground">
          {icon}
        </span>
      </div>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-2xl leading-8 font-semibold tabular-nums">
          {value}
        </span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </article>
  )
}
