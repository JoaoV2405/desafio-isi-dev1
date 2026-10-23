import { HeartPlus } from 'lucide-react'
import type { MatchDetail } from '../services/matches-api'
import { getMatchFieldTeams } from '../lib/match-presentation'
import { MatchField } from '@/shared/components/soccer-field/match-field'
import { FootballIcon } from '@/shared/components/football-icon'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

function HistoricalField({ match }: { match: MatchDetail }) {
  // Keep the score and duels readable even if an old/incomplete payload lacks the field data.
  try {
    const teams = getMatchFieldTeams(match)
    return <MatchField home={teams.home} away={teams.away} />
  } catch {
    return (
      <Alert variant="warning">
        <AlertTitle>Campo indisponível</AlertTitle>
        <AlertDescription>
          Não foi possível identificar todos os titulares históricos desta
          partida.
        </AlertDescription>
      </Alert>
    )
  }
}

export function MatchFieldSection({ match }: { match: MatchDetail }) {
  return (
    <section
      aria-labelledby="match-field-title"
      className="overflow-hidden rounded-xl border bg-card"
    >
      <header className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
        <div className="space-y-1">
          <h2 id="match-field-title" className="text-base font-semibold">
            Em campo
          </h2>
          <p className="text-xs text-muted-foreground">
            Os titulares de cada clube são usados nas disputas que definem o
            resultado da partida.
          </p>
        </div>
        <div
          aria-label="Legenda do campo"
          className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5">
            <HeartPlus aria-hidden="true" className="size-4 text-warning" />
            Mal condicionado
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FootballIcon
              aria-hidden="true"
              className="size-4 text-foreground"
            />
            Gol no duelo
          </span>
        </div>
      </header>
      <div className="p-5">
        <HistoricalField match={match} />
      </div>
    </section>
  )
}
