import { Badge } from '@/components/ui/badge'

export function ClubsHeader({ total }: { total: number | undefined }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3" aria-live="polite">
        <p className="text-sm font-medium">
          {total === undefined ? 'Carregando clubes...' : `${total} clubes`}
        </p>
        {total !== undefined && (
          <Badge variant="secondary" className="rounded-md">
            {total} clubes de 20
          </Badge>
        )}
      </div>
      <p className="ml-auto text-sm text-muted-foreground">
        Ordenados por nome
      </p>
    </div>
  )
}
