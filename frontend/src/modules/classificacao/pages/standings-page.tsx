import { IconPlaceholder } from '@/components/layout/icon-placeholder'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { PageSection } from '@/components/page/page-section'

export function StandingsPage() {
  return (
    <PageContainer>
      <PageHeader
        icon={<IconPlaceholder />}
        title="Classificação"
        description="Acompanhe a posição dos clubes e os resultados da liga."
      />
      <PageSection aria-label="Classificação da liga">
        <p>Você está na página Classificação.</p>
      </PageSection>
    </PageContainer>
  )
}
