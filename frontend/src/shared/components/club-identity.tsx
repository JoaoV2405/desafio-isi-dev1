import type { ClubSummary } from '@/shared/types/club'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface ClubIdentityProps {
  club: ClubSummary | null
  onBuy?: () => void
}

export function ClubIdentity({ club, onBuy }: ClubIdentityProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="rounded-md">
        {club ? club.acronym : 'Livre'}
      </Badge>
      {club ? (
        <span>{club.name}</span>
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
