import { Link } from '@tanstack/react-router'
import { Shirt, ShoppingCart } from 'lucide-react'
import type { ClubDetails } from '../types/club-details'
import { PageHeader } from '@/components/page/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RoutePaths } from '@/router/route-paths'

export function ClubPageHeader({ club }: { club: ClubDetails }) {
  return (
    <PageHeader
      className="flex-col sm:flex-row"
      icon={
        <Badge
          variant="secondary"
          className="size-10 rounded-lg p-0 text-xs font-semibold"
        >
          {club.acronym}
        </Badge>
      }
      title={club.name}
      description={
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge
            variant="outline"
            className="h-auto rounded-md bg-card px-3 py-1 font-medium text-muted-foreground"
          >
            Sigla {club.acronym}
          </Badge>
          {/* O contador só aparece quando o elenco foi informado na resposta. */}
          {club.players !== undefined && (
            <Badge
              variant="outline"
              className="h-auto gap-2 rounded-md tabular-nums bg-card px-3 py-1 font-medium text-muted-foreground"
            >
              <Shirt aria-hidden="true" />
              {club.players.length} de 12 jogadores
            </Badge>
          )}
        </div>
      }
      actions={
        <Button nativeButton={false} render={<Link to={RoutePaths.players} />}>
          <ShoppingCart aria-hidden="true" />
          Comprar jogadores
        </Button>
      }
    />
  )
}
