import { Link } from '@tanstack/react-router'
import { IconPlaceholder } from '@/components/layout/icon-placeholder'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { PageSection } from '@/components/page/page-section'
import { Button } from '@/components/ui/button'
import { RoutePaths } from '@/router/route-paths'

export function MatchPage({ matchId }: { matchId: string }) {
  return (
    <PageContainer>
      <PageHeader
        icon={<IconPlaceholder />}
        title={`Partida ${matchId}`}
        description="Acompanhe o resultado e os duelos da partida."
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to={RoutePaths.matches} />}
          >
            Voltar para partidas
          </Button>
        }
      />
      <PageSection aria-label="Resultado e duelos">
        <p>Você está na página Partida e duelos {matchId}.</p>
      </PageSection>
    </PageContainer>
  )
}
