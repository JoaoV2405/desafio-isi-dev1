import type { MatchSummary } from '../services/matches-api'
import { MatchDuelsLink, MatchResultBadge } from './match-result'
import { formatDateTime } from '@/shared/lib/format-date-time'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ClubSummary } from '@/shared/types/club'

function MatchClub({
  club,
  acronym,
  away = false,
}: {
  club: MatchSummary['home']
  acronym?: string
  away?: boolean
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col items-center gap-3 sm:flex-row',
        away ? 'sm:justify-start' : 'sm:justify-end',
      )}
    >
      <div
        className={cn(
          'min-w-0 space-y-1 text-center',
          away ? 'sm:order-2 sm:text-left' : 'sm:text-right',
        )}
      >
        <p className="text-sm font-bold wrap-anywhere">{club.club_name}</p>
        <p className="text-xs text-muted-foreground">
          {away ? 'Visitante' : 'Mandante'}
        </p>
      </div>
      <Badge
        variant="secondary"
        className="size-10 rounded-lg p-0 text-xs font-semibold sm:size-12"
      >
        {acronym ?? '—'}
      </Badge>
    </div>
  )
}

export function MatchScoreCard({
  match,
  clubs = [],
  showDuelsLink = false,
}: {
  match: MatchSummary
  clubs?: ClubSummary[]
  showDuelsLink?: boolean
}) {
  return (
    <div
      role="group"
      aria-label="Resultado da partida"
      className="rounded-xl border bg-card p-5"
    >
      <div className="grid items-center gap-5 lg:grid-cols-[minmax(8rem,1fr)_minmax(0,4fr)_minmax(8rem,1fr)]">
        <div aria-hidden="true" className="hidden lg:block" />
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-6">
          <MatchClub
            club={match.home}
            acronym={
              clubs.find((club) => club.id === match.home.club_id)?.acronym
            }
          />
          <div className="flex flex-col items-center gap-2 text-center">
            <p
              aria-label="Placar"
              className="rounded-lg bg-muted px-5 py-2 text-2xl font-bold whitespace-nowrap tabular-nums"
            >
              {match.home.goals} x {match.away.goals}
            </p>
            <time
              dateTime={match.played_at}
              className="text-xs whitespace-nowrap text-muted-foreground"
            >
              {formatDateTime(match.played_at).replace(' ', ', ')}
            </time>
            <MatchResultBadge result={match.result} />
          </div>
          <MatchClub
            club={match.away}
            acronym={
              clubs.find((club) => club.id === match.away.club_id)?.acronym
            }
            away
          />
        </div>
        {showDuelsLink && (
          <div className="justify-self-end">
            <MatchDuelsLink match={match} />
          </div>
        )}
      </div>
    </div>
  )
}
