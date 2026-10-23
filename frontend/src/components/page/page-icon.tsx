import type { LucideIcon } from 'lucide-react'

export function PageIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary-soft-foreground bg-primary-soft text-primary-soft-foreground"
    >
      <Icon className="size-5" />
    </span>
  )
}
