import { IconPlaceholder } from '@/components/layout/icon-placeholder'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { PageSection } from '@/components/page/page-section'
import { Button } from '@/components/ui/button'
import { ClubsTable } from '../components/clubs-table'

export function ClubsPage() {
  return (
    <PageContainer>
      <PageHeader
        icon={<IconPlaceholder />}
        title="Clubes"
        description="Acompanhe os clubes e gerencie sua participação na liga."
        actions={
          // TODO: abrir o formulário de criação de clube.
          <Button disabled>
            <IconPlaceholder />
            Criar clube
          </Button>
        }
      />
      <PageSection aria-label="Clubes">
        <ClubsTable />
      </PageSection>
    </PageContainer>
  )
}
