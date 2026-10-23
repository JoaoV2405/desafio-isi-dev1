import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const contractStatusLabels = {
  ATIVO: 'Ativo',
  ENCERRADO: 'Encerrado',
  RESCINDIDO: 'Rescindido',
} as const

export function ContractStatusBadge({
  status,
}: {
  status: keyof typeof contractStatusLabels
}) {
  const isActive = status === 'ATIVO'

  return (
    <Badge variant={isActive ? 'success' : 'secondary'} className="gap-1.5">
      <span
        aria-hidden="true"
        className={cn(
          'size-1.5 shrink-0 rounded-full',
          isActive ? 'bg-success' : 'bg-black',
        )}
      />
      {contractStatusLabels[status]}
    </Badge>
  )
}
