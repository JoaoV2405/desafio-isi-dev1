import { IconPlaceholder } from '@/components/layout/icon-placeholder'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { PageSection } from '@/components/page/page-section'
import { Button } from '@/components/ui/button'

export function MatchesPage() {
  return (
    <PageContainer>
      <PageHeader
        icon={<IconPlaceholder />}
        title="Partidas"
        description="Consulte o histórico e organize os confrontos da liga."
        actions={
          // TODO: abrir o formulário de nova partida.
          <Button disabled>
            <IconPlaceholder />
            Criar partida
          </Button>
        }
      />
      <PageSection aria-label="Histórico de partidas">
        <p>Você está na página Partidas.</p>
      </PageSection>
    </PageContainer>
  )
}
