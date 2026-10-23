import { useMatches } from '../hooks/use-matches'
import { MatchScoreCard } from './match-score-card'
import { ContentErrorState } from '@/components/custom/content-error-state'
import { useClubs } from '@/modules/clubes/hooks/use-clubs'

export function LatestMatchCard() {
  const { data: clubs } = useClubs()
  const { data, isPending, isError, error } = useMatches()
  const match = data?.[0]

  return (
    <section aria-labelledby="latest-match-title" className="space-y-3">
      <h2
        id="latest-match-title"
        className="text-xs font-medium text-muted-foreground"
      >
        Última partida
      </h2>
      {isPending || isError || !match ? (
        <div className="rounded-xl border bg-card p-5">
          {isPending ? (
            <p
              role="status"
              className="py-6 text-center text-sm text-muted-foreground"
            >
              Carregando última partida...
            </p>
          ) : isError ? (
            <ContentErrorState
              title="Não foi possível carregar a última partida"
              error={error}
            />
          ) : (
            <p
              role="status"
              className="py-6 text-center text-sm text-muted-foreground"
            >
              Nenhuma partida realizada.
            </p>
          )}
        </div>
      ) : (
        <MatchScoreCard match={match} clubs={clubs} showDuelsLink />
      )}
    </section>
  )
}
