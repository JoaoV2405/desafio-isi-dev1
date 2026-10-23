import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import type { MatchSummary } from '../services/matches-api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RoutePaths } from '@/router/route-paths'

const resultLabels: Record<MatchSummary['result'], string> = {
  MANDANTE: 'Vitória do mandante',
  VISITANTE: 'Vitória do visitante',
  EMPATE: 'Empate',
}

export function MatchResultBadge({
  result,
}: {
  result: MatchSummary['result']
}) {
  return <Badge variant="outline">{resultLabels[result]}</Badge>
}

export function MatchDuelsLink({ match }: { match: MatchSummary }) {
  return (
    <Button
      variant="ghost"
      nativeButton={false}
      className="shadow-none"
      render={
        <Link
          to={RoutePaths.match}
          params={{ partidaId: String(match.id) }}
          aria-label={`Ver duelos: ${match.home.club_name} x ${match.away.club_name}`}
        />
      }
    >
      Ver duelos
      <ChevronRight aria-hidden="true" />
    </Button>
  )
}
