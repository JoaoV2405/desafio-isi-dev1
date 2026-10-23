import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, CircleCheck } from 'lucide-react'
import { useMatch } from '../hooks/use-match'
import { formatMatchLabel } from '../lib/match-presentation'
import { MatchScoreCard } from '../components/match-score-card'
import { MatchFieldSection } from '../components/match-field-section'
import { MatchDuelsTable } from '../components/match-duels-table'
import { PageContainer } from '@/components/page/page-container'
import { PageSkeleton } from '@/components/page/page-skeleton'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ContentErrorState } from '@/components/custom/content-error-state'
import { ContentState } from '@/components/custom/content-state'
import { ApiError } from '@/shared/lib/api-error'
import { RoutePaths } from '@/router/route-paths'
import { useClubs } from '@/modules/clubes/hooks/use-clubs'

export function MatchPage({ matchId }: { matchId: string }) {
  const createdMatchId = useLocation({
    select: (location) => location.state.createdMatchId,
  })
  const [wasJustPlayed] = useState(() => createdMatchId === Number(matchId))
  const navigate = useNavigate()
  const { data: match, isPending, isError, error } = useMatch(matchId)
  const { data: clubs } = useClubs()

  useEffect(() => {
    if (createdMatchId !== Number(matchId)) return
    // Consume the creation marker so revisiting this history entry does not announce a new match.
    void navigate({
      to: RoutePaths.match,
      params: { partidaId: matchId },
      replace: true,
      state: (previous) => ({ ...previous, createdMatchId: undefined }),
    })
  }, [createdMatchId, matchId, navigate])

  return (
    <PageContainer>
      <header className="flex items-center">
        <h1 className="sr-only">
          Duelos da partida{match ? `: ${formatMatchLabel(match)}` : ''}
        </h1>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link to={RoutePaths.matches} />}
        >
          <ArrowLeft aria-hidden="true" />
          Voltar para partidas
        </Button>
      </header>
      {isPending ? (
        <PageSkeleton showHeader={false} />
      ) : isError && error instanceof ApiError && error.status === 404 ? (
        <ContentState
          variant="not-found"
          title="Partida não encontrada"
          description={error.message}
          action={{
            label: 'Voltar para partidas',
            onClick: () => {
              void navigate({ to: RoutePaths.matches })
            },
          }}
        />
      ) : isError ? (
        <ContentErrorState
          title="Não foi possível carregar a partida"
          error={error}
        />
      ) : (
        <>
          {wasJustPlayed && (
            <Alert variant="success" role="status">
              <CircleCheck aria-hidden="true" />
              <AlertTitle>Partida jogada</AlertTitle>
              <AlertDescription>{formatMatchLabel(match)}</AlertDescription>
            </Alert>
          )}
          <MatchScoreCard match={match} clubs={clubs} />
          <MatchFieldSection match={match} />
          <MatchDuelsTable match={match} clubs={clubs} />
        </>
      )}
    </PageContainer>
  )
}
