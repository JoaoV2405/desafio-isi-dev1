import { IconPlaceholder } from '@/components/layout/icon-placeholder'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { PageSection } from '@/components/page/page-section'
import { Button } from '@/components/ui/button'
import { PlayersTable } from '../components/players-table'

export function PlayersPage() {
  return (
    <PageContainer>
      <PageHeader
        icon={<IconPlaceholder />}
        title="Jogadores"
        description="Gerencie os jogadores e acompanhe o mercado da liga."
        actions={
          // TODO: abrir o formulário de cadastro de jogador.
          <Button disabled>
            <IconPlaceholder />
            Novo jogador
          </Button>
        }
      />
      <PageSection aria-label="Jogadores">
        <PlayersTable />
      </PageSection>
    </PageContainer>
  )
}
