import type { ClubSummary } from '@/shared/types/club'
import { Link } from '@tanstack/react-router'
import { Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RoutePaths } from '@/router/route-paths'

export interface ClubIdentityProps {
  club:
    | (Pick<ClubSummary, 'id' | 'name'> & Partial<Pick<ClubSummary, 'acronym'>>)
    | null
  onBuy?: () => void
  linkToClub?: boolean
}

export function ClubIdentity({
  club,
  onBuy,
  linkToClub = false,
}: ClubIdentityProps) {
  return (
    <div className="flex items-center gap-2">
      {club && !club.acronym ? (
        <Shield
          aria-hidden="true"
          className="size-5 shrink-0 text-muted-foreground"
        />
      ) : (
        <Badge variant="secondary" className="rounded-md">
          {club ? club.acronym : 'Livre'}
        </Badge>
      )}
      {club ? (
        linkToClub ? (
          <Link
            to={RoutePaths.club}
            params={{ clubeId: String(club.id) }}
            className="underline-offset-4 underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {club.name}
          </Link>
        ) : (
          <span>{club.name}</span>
        )
      ) : (
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={!onBuy}
          onClick={onBuy}
        >
          Comprar
        </Button>
      )}
    </div>
  )
}
