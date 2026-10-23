import { useDashboard } from '../hooks/use-dashboard'
import { HomeIntroduction } from './home-introduction'
import { HomeStats } from './home-stats'
import { ErrorAlert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useStandings } from '@/modules/classificacao/use-classificacao'

export function HomeOverview() {
  const dashboard = useDashboard({ refetchOnMount: 'always' })
  const standings = useStandings({ refetchOnMount: 'always' })
  const summary = dashboard.data
  const leader = standings.data?.[0]
  const leaderName = standings.data
    ? (leader?.club_name ?? 'Sem líder')
    : summary
      ? (summary.leader ?? 'Sem líder')
      : '—'

  return (
    <header className="flex flex-col items-center text-center">
      <HomeIntroduction leaderName={leaderName} leaderPoints={leader?.points} />
      <HomeStats
        summary={summary}
        isPending={dashboard.isPending}
        isFetching={dashboard.isFetching}
      />
      {(dashboard.isError || standings.isError) && (
        <div className="mt-4 w-full max-w-2xl space-y-3">
          {dashboard.isError && (
            <ErrorAlert
              title={
                summary
                  ? 'Não foi possível atualizar o resumo'
                  : 'Não foi possível carregar o resumo'
              }
              descriptionClassName="space-y-2 whitespace-pre-line"
            >
              <p>{dashboard.error.message}</p>
              <Button
                variant="outline"
                size="sm"
                disabled={dashboard.isFetching}
                onClick={() => void dashboard.refetch()}
              >
                Tentar novamente
              </Button>
            </ErrorAlert>
          )}
          {standings.isError && (
            <ErrorAlert
              title="Não foi possível atualizar os pontos do líder"
              descriptionClassName="space-y-2 whitespace-pre-line"
            >
              <p>{standings.error.message}</p>
              <Button
                variant="outline"
                size="sm"
                disabled={standings.isFetching}
                onClick={() => void standings.refetch()}
              >
                Tentar novamente
              </Button>
            </ErrorAlert>
          )}
        </div>
      )}
    </header>
  )
}
