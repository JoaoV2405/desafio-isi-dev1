import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function PageSection({
  className,
  ...props
}: ComponentProps<'section'>) {
  return (
    <section
      data-slot="page-section"
      className={cn('w-full min-w-0', className)}
      {...props}
    />
  )
}
