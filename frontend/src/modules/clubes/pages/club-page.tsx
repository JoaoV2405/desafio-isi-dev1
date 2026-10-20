import { Link } from '@tanstack/react-router'
import { ClubPageHeader } from '../components/club-page-header'
import { ClubSummaryCard } from '../components/club-summary-card'
import { ClubTabs } from '../components/club-tabs'
import { useClub } from '../hooks/use-club'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { PageSection } from '@/components/page/page-section'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RoutePaths } from '@/router/route-paths'
import { formatMoney } from '@/shared/lib/format-money'

export function ClubPage({ clubId }: { clubId: string }) {
  const { data: club, isPending, isError, error } = useClub(clubId)

  if (isPending) {
    return (
      <PageContainer>
        <PageHeader title="Clube" />
        <p role="status" className="text-sm text-muted-foreground">
          Carregando clube...
        </p>
      </PageContainer>
    )
  }

  if (isError || !club) {
    return (
      <PageContainer>
        <PageHeader title="Clube" />
        <Alert variant={isError ? 'destructive' : 'default'}>
          <AlertTitle>
            {isError
              ? 'Não foi possível carregar o clube'
              : 'Clube não encontrado'}
          </AlertTitle>
          <AlertDescription>
            {isError ? error.message : 'O clube informado não foi encontrado.'}
          </AlertDescription>
        </Alert>
        <div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to={RoutePaths.clubs} />}
          >
            Voltar para clubes
          </Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <ClubPageHeader club={club} />
      <PageSection
        aria-label="Indicadores do clube"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <ClubSummaryCard
          title="Caixa"
          value={formatMoney(club.cash)}
          unit="moedas"
          description="Disponível para contratações"
        />
        <ClubSummaryCard
          title="Valor do Elenco"
          value={
            club.squad_value === undefined ? '—' : formatMoney(club.squad_value)
          }
          unit={club.squad_value === undefined ? undefined : 'moedas'}
          description="Valor de mercado dos jogadores"
        />
        <ClubSummaryCard
          title="Patrimônio"
          value={
            club.net_worth === undefined ? '—' : formatMoney(club.net_worth)
          }
          unit={club.net_worth === undefined ? undefined : 'moedas'}
          description="Caixa e valor do elenco"
        />
        <ClubSummaryCard
          title="Elenco"
          value={club.players?.length ?? '—'}
          description="Jogadores vinculados ao clube"
        />
      </PageSection>
      <PageSection aria-label="Elenco, escalação e histórico">
        {/* A ausência de elenco não deve ser apresentada como uma coleção vazia. */}
        {club.players === undefined ? (
          <p role="status" className="text-sm text-muted-foreground">
            Elenco não disponível para consulta.
          </p>
        ) : (
          <ClubTabs key={club.id} players={club.players} />
        )}
      </PageSection>
    </PageContainer>
  )
}
