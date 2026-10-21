import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import type { ClubPlayer } from '../types/club-details'
import type { PlayerSale } from '../types/player-sale'
import type { ClubTab } from '../components/club-tabs'
import { ClubPageHeader } from '../components/club-page-header'
import { ClubSummaryCard } from '../components/club-summary-card'
import { ClubTabs } from '../components/club-tabs'
import { useClub } from '../hooks/use-club'
import { SellPlayerModal } from '../components/sell-player-modal'
import { SellPlayerSuccessModal } from '../components/sell-player-success-modal'
import { sellPlayer } from '../services/clubs-api'
import { usePlayerMutation } from '@/modules/jogadores/hooks/use-player-mutation'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { PageSection } from '@/components/page/page-section'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RoutePaths } from '@/router/route-paths'
import { formatMoney } from '@/shared/lib/format-money'

export function ClubPage({ clubId }: { clubId: string }) {
  const createdClubId = useLocation({
    select: (location) => location.state.createdClubId,
  })
  const { data: club, isPending, isError, error } = useClub(clubId)
  const [playerToSell, setPlayerToSell] = useState<ClubPlayer | null>(null)
  const [saleResult, setSaleResult] = useState<PlayerSale | null>(null)
  const [activeTab, setActiveTab] = useState<ClubTab>('roster')
  const sale = usePlayerMutation(sellPlayer, (result) => {
    setPlayerToSell(null)
    setSaleResult(result)
  })

  // A seleção abre a confirmação; somente o onConfirm do modal envia a venda.
  function handleSellPlayer(player: ClubPlayer) {
    if (sale.isPending) return
    sale.reset()
    setSaleResult(null)
    setPlayerToSell(player)
  }

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

  if (isError) {
    return (
      <PageContainer>
        <PageHeader title="Clube" />
        <Alert variant="destructive">
          <AlertTitle>Não foi possível carregar o clube</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
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
      {createdClubId === club.id && (
        <Alert variant="success" role="status">
          <AlertTitle>{club.name} criado com sucesso.</AlertTitle>
          <AlertDescription>
            O clube está pronto para receber jogadores.
          </AlertDescription>
        </Alert>
      )}
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
          title="Valor do elenco"
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
          <ClubTabs
            key={club.id}
            players={club.players}
            value={activeTab}
            onValueChange={setActiveTab}
            onSellPlayer={handleSellPlayer}
            isSubmitting={sale.isPending}
          />
        )}
      </PageSection>
      {playerToSell && (
        <SellPlayerModal
          key={playerToSell.id}
          player={playerToSell}
          clubId={club.id}
          onOpenChange={(open) => {
            if (!open && !sale.isPending) setPlayerToSell(null)
          }}
          onConfirm={() => sale.submit(playerToSell.id)}
          isSubmitting={sale.isPending}
          error={sale.error}
        />
      )}
      {saleResult && (
        <SellPlayerSuccessModal
          sale={saleResult}
          onOpenChange={(open) => {
            if (!open) setSaleResult(null)
          }}
          onViewHistory={() => setActiveTab('history')}
        />
      )}
    </PageContainer>
  )
}
