import { Link } from '@tanstack/react-router'
import { IconPlaceholder } from '@/components/layout/icon-placeholder'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { PageSection } from '@/components/page/page-section'
import { Button } from '@/components/ui/button'
import { RoutePaths } from '@/router/route-paths'

export function HomePage() {
  return (
    <PageContainer>
      <PageHeader
        icon={<IconPlaceholder />}
        title="Passe"
        description="Gerencie os jogadores, os clubes e as partidas da sua liga."
        actions={
          <Button
            nativeButton={false}
            render={<Link to={RoutePaths.players} />}
          >
            Iniciar
          </Button>
        }
      />
      <PageSection aria-label="Apresentação">
        <p>Você está na página Início.</p>
      </PageSection>
    </PageContainer>
  )
}
