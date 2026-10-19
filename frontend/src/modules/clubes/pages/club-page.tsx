import { Link } from '@tanstack/react-router'
import { IconPlaceholder } from '@/components/layout/icon-placeholder'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { PageSection } from '@/components/page/page-section'
import { Button } from '@/components/ui/button'
import { RoutePaths } from '@/router/route-paths'

export function ClubPage({ clubId }: { clubId: string }) {
  return (
    <PageContainer>
      <PageHeader
        icon={<IconPlaceholder />}
        title={`Clube ${clubId}`}
        description="Consulte o elenco, a escalação e o histórico do clube."
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to={RoutePaths.clubs} />}
          >
            Voltar para clubes
          </Button>
        }
      />
      <PageSection aria-label="Detalhes do clube">
        <p>Você está na página Clube {clubId}.</p>
      </PageSection>
    </PageContainer>
  )
}
