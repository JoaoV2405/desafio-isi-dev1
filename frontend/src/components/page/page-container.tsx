import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function PageContainer({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-container"
      className={cn(
        'flex w-full min-w-0 flex-col items-stretch gap-6 p-6 [&>*]:w-full',
        className,
      )}
      {...props}
    />
  )
}
