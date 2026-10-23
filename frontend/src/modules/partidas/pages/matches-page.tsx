import { useState } from 'react'
import { Plus, Swords } from 'lucide-react'
import { CreateMatchModal } from '../components/create-match-modal'
import { LatestMatchCard } from '../components/latest-match-card'
import { MatchesHistory } from '../components/matches-history'
import { PageIcon } from '@/components/page/page-icon'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { Button } from '@/components/ui/button'

export function MatchesPage() {
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false)

  return (
    <PageContainer>
      <PageHeader
        icon={<PageIcon icon={Swords} />}
        title="Partidas"
        description="Consulte o histórico e organize os confrontos da liga."
        actions={
          <Button type="button" onClick={() => setIsCreateMatchOpen(true)}>
            <Plus aria-hidden="true" />
            Nova partida
          </Button>
        }
      />
      <LatestMatchCard />
      <MatchesHistory />
      {isCreateMatchOpen && (
        <CreateMatchModal onOpenChange={setIsCreateMatchOpen} />
      )}
    </PageContainer>
  )
}
