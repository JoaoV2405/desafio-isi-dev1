import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PageHeaderProps extends Omit<
  ComponentProps<'header'>,
  'title'
> {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export function PageHeader({
  icon,
  title,
  description,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn('flex w-full items-start justify-between gap-6', className)}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {icon != null && (
          <div
            data-slot="page-header-icon"
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center [&>svg]:size-6"
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl leading-8 font-semibold tracking-[-0.025em]">
            {title}
          </h1>
          {description != null && (
            <div
              data-slot="page-header-description"
              className="text-sm text-muted-foreground"
            >
              {description}
            </div>
          )}
        </div>
      </div>
      {actions != null && (
        <div
          data-slot="page-header-actions"
          className="ml-auto flex shrink-0 items-center gap-2"
        >
          {actions}
        </div>
      )}
    </header>
  )
}
