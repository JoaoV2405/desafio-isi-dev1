import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import type { MatchSummary } from '@/modules/partidas/services/matches-api'
import { useMatches } from '@/modules/partidas/hooks/use-matches'
import { RoutePaths } from '@/router/route-paths'
import { formatDateTime } from '@/shared/lib/format-date-time'
import { cn } from '@/lib/utils'

export function RecentMatchResult({ match }: { match: MatchSummary }) {
  return (
    <li className="space-y-2">
      <time
        dateTime={match.played_at}
        className="block text-xs text-muted-foreground"
      >
        {formatDateTime(match.played_at).replace(' ', ', ')}
      </time>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 text-sm">
        <span
          className={cn(
            'wrap-anywhere',
            match.result === 'MANDANTE' && 'font-bold',
          )}
        >
          {match.home.club_name}
        </span>
        <span className="whitespace-nowrap tabular-nums">
          {match.home.goals} x {match.away.goals}
        </span>
        <span
          className={cn(
            'text-right wrap-anywhere',
            match.result === 'VISITANTE' && 'font-bold',
          )}
        >
          {match.away.club_name}
        </span>
      </div>
    </li>
  )
}

export function RecentMatchesCard() {
  const { data, isPending, isError, error } = useMatches()

  return (
    <section
      aria-labelledby="recent-matches-title"
      className="space-y-5 rounded-xl border bg-card p-5"
    >
      <header className="space-y-1">
        <h2 id="recent-matches-title" className="text-base font-semibold">
          Últimas partidas
        </h2>
        <p className="text-xs text-muted-foreground">
          Da mais recente para a mais antiga
        </p>
      </header>
      {isPending ? (
        <p role="status" className="text-sm text-muted-foreground">
          Carregando partidas...
        </p>
      ) : isError ? (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      ) : data.length === 0 ? (
        <p role="status" className="text-sm text-muted-foreground">
          Nenhuma partida realizada.
        </p>
      ) : (
        <ul className="space-y-5">
          {data.slice(0, 2).map((match) => (
            <RecentMatchResult key={match.id} match={match} />
          ))}
        </ul>
      )}
      <footer>
        <Link
          to={RoutePaths.matches}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Ver todas as partidas
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </footer>
    </section>
  )
}
