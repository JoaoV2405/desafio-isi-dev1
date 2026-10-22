import { StandingsTable } from '../components/classificacao-table'
import { RecentMatchesCard } from '../components/recent-matches-card'
import { StandingsOrderCard } from '../components/standings-order-card'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { IconPlaceholder } from '@/components/layout/icon-placeholder'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { PageSection } from '@/components/page/page-section'
import { Button } from '@/components/ui/button'
import { CreateMatchModal } from '@/modules/partidas/components/create-match-modal'

export function StandingsPage() {
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false)

  return (
    <PageContainer>
      <PageHeader
        icon={<IconPlaceholder />}
        title="Classificação"
        description="Acompanhe a posição dos clubes e os resultados da liga."
        actions={
          <Button type="button" onClick={() => setIsCreateMatchOpen(true)}>
            <Plus aria-hidden="true" />
            Nova partida
          </Button>
        }
      />
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <PageSection aria-label="Classificação da liga">
          <StandingsTable />
        </PageSection>
        <aside
          aria-label="Informações da classificação"
          className="min-w-0 space-y-6"
        >
          <RecentMatchesCard />
          <StandingsOrderCard />
        </aside>
      </div>
      {isCreateMatchOpen && (
        <CreateMatchModal onOpenChange={setIsCreateMatchOpen} />
      )}
    </PageContainer>
  )
}
