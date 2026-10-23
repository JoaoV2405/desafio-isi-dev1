import { useState } from 'react'
import { CreatePlayerModal } from '../components/player-modal/create-player-modal'
import { CreatePlayerSuccessModal } from '../components/player-modal/create-player-success-modal'
import { EditPlayerModal } from '../components/player-modal/edit-player-modal'
import { EditPlayerConditionModal } from '../components/player-modal/edit-player-condition-modal'
import { DeletePlayerModal } from '../components/player-modal/delete-player-modal'
import { BuyPlayerModal } from '../components/player-modal/buy-player-modal'
import { BuyPlayerSuccessModal } from '../components/player-modal/buy-player-success-modal'
import type { PlayerPurchase } from '../types/player-purchase'
import type { Player } from '@/shared/types/player'
import { Plus, UsersRound } from 'lucide-react'
import { PageIcon } from '@/components/page/page-icon'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { PageSection } from '@/components/page/page-section'
import { Button } from '@/components/ui/button'
import { PlayersTable } from '../components/player-table/players-table'
import { PlayerDrawer } from '../components/player-drawer'
import { usePlayerMutation } from '../hooks/use-player-mutation'
import {
  createPlayer,
  updatePlayer,
  updatePlayerCondition,
  buyPlayer,
  deletePlayer,
} from '../services/players-api'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/components/ui/toast'
import { formatMoney } from '@/shared/lib/format-money'
import { PLAYER_CONDITIONS } from '@/shared/types/player'

export type PlayerAction = 'details' | 'edit' | 'condition' | 'delete' | 'buy'

export function PlayersPage() {
  const [createdPlayer, setCreatedPlayer] = useState<Player | null>(null)
  const [purchaseResult, setPurchaseResult] = useState<PlayerPurchase | null>(
    null,
  )
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  // Estas ações compartilham um jogador e abrem um único modal/drawer por vez.
  // Outros fluxos da página podem manter estados e callbacks próprios, como o cadastro acima.
  const [selectedAction, setSelectedAction] = useState<{
    type: PlayerAction
    player: Player
  } | null>(null)
  const [feedback, setFeedback] = useState<{
    title: string
    description?: string
  } | null>(null)

  function finishAction() {
    setFeedback(null)
    setCreatedPlayer(null)
    setIsCreateModalOpen(false)
    setSelectedAction(null)
  }

  // Cada operação mantém seu próprio erro e só fecha o modal após sucesso e atualização dos dados.
  const create = usePlayerMutation(createPlayer, (player) => {
    finishAction()
    setCreatedPlayer(player)
  })
  const edit = usePlayerMutation(updatePlayer, (player) => {
    finishAction()
    toast.add({
      type: 'success',
      title: 'Jogador editado',
      description: `${player.name} teve os dados atualizados. Condição: ${PLAYER_CONDITIONS[player.condition]}. Valor de mercado: ${formatMoney(player.market_value)}.`,
      timeout: 5000,
    })
  })
  const condition = usePlayerMutation(updatePlayerCondition, (player) => {
    finishAction()
    toast.add({
      type: 'success',
      title: 'Condição alterada',
      description: `${player.name} agora está ${PLAYER_CONDITIONS[player.condition]}. Valor de mercado: ${formatMoney(player.market_value)}.`,
      timeout: 5000,
    })
  })
  const deletion = usePlayerMutation(
    async (player: Player) => {
      await deletePlayer(player.id)
      return player
    },
    (player) => {
      finishAction()
      toast.add({
        type: 'success',
        title: 'Jogador excluído',
        description: `${player.name} saiu da lista. Transações e partidas antigas dele continuam gravadas.`,
        timeout: 5000,
      })
    },
  )
  const purchase = usePlayerMutation(buyPlayer, (result) => {
    finishAction()
    setFeedback({ title: `${result.player_name} contratado com sucesso.` })
    setPurchaseResult(result)
  })
  const isSubmitting =
    create.isPending ||
    edit.isPending ||
    condition.isPending ||
    deletion.isPending ||
    purchase.isPending

  function resetErrors() {
    create.reset()
    edit.reset()
    condition.reset()
    deletion.reset()
    purchase.reset()
  }

  // A tabela chama este callback para selecionar o jogador e abrir a interface da ação.
  // A requisição só acontece quando o usuário confirma no modal.
  function handlePlayerAction(type: PlayerAction, player: Player) {
    if (isSubmitting) return
    resetErrors()
    setFeedback(null)
    setCreatedPlayer(null)
    setPurchaseResult(null)
    setIsCreateModalOpen(false)
    setSelectedAction({ type, player })
  }

  function changeCreateModalOpen(open: boolean) {
    if (isSubmitting) return
    if (open) {
      resetErrors()
      setFeedback(null)
      setCreatedPlayer(null)
      setPurchaseResult(null)
    }
    if (open && selectedAction !== null) {
      setSelectedAction(null)
    }
    setIsCreateModalOpen(open)
  }

  function changeActionModalOpen(open: boolean) {
    if (!open && !isSubmitting) setSelectedAction(null)
  }

  return (
    <PageContainer>
      <PageHeader
        icon={<PageIcon icon={UsersRound} />}
        title="Jogadores"
        description="Gerencie os jogadores e acompanhe o mercado da liga."
        actions={
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => changeCreateModalOpen(true)}
          >
            <Plus />
            Adicionar jogador
          </Button>
        }
      />
      {feedback && (
        <Alert variant="success" role="status">
          <AlertTitle>{feedback.title}</AlertTitle>
          {feedback.description && (
            <AlertDescription>{feedback.description}</AlertDescription>
          )}
        </Alert>
      )}
      <PageSection aria-label="Jogadores">
        {/* O filho recebe o callback; a página mantém a seleção e controla os modais. */}
        <PlayersTable
          onPlayerAction={handlePlayerAction}
          onCreatePlayer={() => changeCreateModalOpen(true)}
        />
      </PageSection>
      {isCreateModalOpen && (
        <CreatePlayerModal
          open
          onOpenChange={changeCreateModalOpen}
          onConfirm={create.submit}
          isSubmitting={create.isPending}
          error={create.error}
        />
      )}
      {createdPlayer && (
        <CreatePlayerSuccessModal
          player={createdPlayer}
          onOpenChange={(open) => {
            if (!open) setCreatedPlayer(null)
          }}
          onViewDetails={() => handlePlayerAction('details', createdPlayer)}
        />
      )}
      {/* A ação selecionada fornece os dados atuais e desmonta o formulário ao fechar. */}
      {selectedAction?.type === 'edit' && (
        <EditPlayerModal
          key={selectedAction.player.id}
          open
          player={selectedAction.player}
          onOpenChange={changeActionModalOpen}
          onConfirm={(input) =>
            edit.submit({ playerId: selectedAction.player.id, input })
          }
          isSubmitting={edit.isPending}
          error={edit.error}
        />
      )}
      {/* A mesma seleção controla o drawer de detalhes e impede sobreposição com os modais. */}
      {selectedAction?.type === 'details' && (
        <PlayerDrawer
          key={selectedAction.player.id}
          open
          player={selectedAction.player}
          onOpenChange={changeActionModalOpen}
          onAction={handlePlayerAction}
        />
      )}
      {/* Compartilha a ação selecionada para manter apenas um dos modais aberto por vez. */}
      {selectedAction?.type === 'condition' && (
        <EditPlayerConditionModal
          key={selectedAction.player.id}
          open
          player={selectedAction.player}
          onOpenChange={changeActionModalOpen}
          onConfirm={(player, nextCondition) =>
            condition.submit({ playerId: player.id, condition: nextCondition })
          }
          isSubmitting={condition.isPending}
          error={condition.error}
        />
      )}
      {/* Reutiliza a ação selecionada para abrir a confirmação sem sobrepor outro modal. */}
      {selectedAction?.type === 'delete' && (
        <DeletePlayerModal
          open
          player={selectedAction.player}
          onOpenChange={changeActionModalOpen}
          onConfirm={deletion.submit}
          isSubmitting={deletion.isPending}
          error={deletion.error}
        />
      )}
      {selectedAction?.type === 'buy' && (
        <BuyPlayerModal
          key={selectedAction.player.id}
          open
          player={selectedAction.player}
          onOpenChange={changeActionModalOpen}
          // A confirmação conecta o modal à mutation da página, que chama o serviço HTTP.
          onConfirm={(input) =>
            purchase.submit({ playerId: selectedAction.player.id, input })
          }
          isSubmitting={purchase.isPending}
          error={purchase.error}
        />
      )}
      {purchaseResult && (
        <BuyPlayerSuccessModal
          purchase={purchaseResult}
          onOpenChange={(open) => {
            if (!open) setPurchaseResult(null)
          }}
        />
      )}
    </PageContainer>
  )
}
