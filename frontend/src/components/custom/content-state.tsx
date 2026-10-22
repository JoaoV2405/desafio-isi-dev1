import { useId } from 'react'
import type { ReactNode } from 'react'
import { CircleAlert, Inbox, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ContentStateProps {
  variant: 'error' | 'not-found' | 'empty'
  title: string
  description: ReactNode
  action?: {
    label: string
    onClick: () => void
    disabled?: boolean
    isPending?: boolean
    pendingLabel?: string
  }
  className?: string
}

const icons = {
  error: CircleAlert,
  'not-found': SearchX,
  empty: Inbox,
}

export function ContentState({
  variant,
  title,
  description,
  action,
  className,
}: ContentStateProps) {
  const id = useId()
  const Icon = icons[variant]

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      data-slot="content-state"
      data-variant={variant}
      className={cn(
        'flex min-h-48 w-full min-w-0 flex-col items-center justify-center gap-3 p-6 text-center text-foreground',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
      >
        <Icon className="size-6" />
      </span>
      <h2
        id={`${id}-title`}
        className="max-w-full text-base leading-6 font-semibold wrap-anywhere"
      >
        {title}
      </h2>
      <div
        id={`${id}-description`}
        className="max-w-prose text-sm whitespace-pre-line text-muted-foreground wrap-anywhere"
      >
        {description}
      </div>
      {action && (
        <Button
          type="button"
          variant="ghost"
          className="max-w-full shadow-none"
          disabled={action.disabled || action.isPending}
          aria-busy={action.isPending || undefined}
          onClick={action.onClick}
        >
          {action.isPending
            ? (action.pendingLabel ?? action.label)
            : action.label}
        </Button>
      )}
    </div>
  )
}
