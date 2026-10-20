import { Link } from '@tanstack/react-router'
import { Shield, Shirt, ShoppingCart } from 'lucide-react'
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
        <span className="relative flex size-10 items-center justify-center">
          <Shield className="size-10 text-muted-foreground" strokeWidth={1.5} />
          <span className="absolute text-[9px] font-bold">{club.acronym}</span>
        </span>
      }
      title={club.name}
      description={
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge
            variant="outline"
            className="h-auto rounded-md bg-white px-2.5 py-1 font-normal text-gray-600"
          >
            Sigla {club.acronym}
          </Badge>
          {/* O contador só aparece quando o elenco foi informado na resposta. */}
          {club.players !== undefined && (
            <Badge
              variant="outline"
              className="h-auto gap-1.5 rounded-md bg-white px-2.5 py-1 font-normal text-gray-600"
            >
              <Shirt aria-hidden="true" />
              {club.players.length} de 12 Jogadores
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
