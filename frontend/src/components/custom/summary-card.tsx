import type { ReactNode } from 'react'
import { IconPlaceholder } from '@/components/layout/icon-placeholder'

interface SummaryCardProps {
  title: string
  value: ReactNode
  unit?: string
  description: string
  icon?: ReactNode
}

export function SummaryCard({
  title,
  value,
  unit,
  description,
  icon = <IconPlaceholder />,
}: SummaryCardProps) {
  return (
    <article className="min-w-0 space-y-3 rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-bold text-muted-foreground">{title}</h2>
        <span aria-hidden="true" className="shrink-0 text-muted-foreground">
          {icon}
        </span>
      </div>
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </article>
  )
}
