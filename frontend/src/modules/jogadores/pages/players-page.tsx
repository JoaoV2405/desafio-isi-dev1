import { useState } from 'react'
import { CreatePlayerModal } from '../components/player-modal/create-player-modal'
import {
  EditPlayerModal,
  EditPlayerConditionModal,
} from '../components/player-modal/edit-player-modal'
import { DeletePlayerModal } from '../components/player-modal/delete-player-modal'
import { BuyPlayerModal } from '../components/player-modal/buy-player-modal'
import { BuyPlayerSuccessModal } from '../components/player-modal/buy-player-success-modal'
import type { PlayerPurchase } from '../types/player-purchase'
import type { Player } from '@/shared/types/player'
import { IconPlaceholder } from '@/components/layout/icon-placeholder'
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
} from '../services/player-mutations'
import { deletePlayer } from '../services/delete-player'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { formatMoney } from '@/shared/lib/format-money'
import { PLAYER_CONDITIONS } from '@/shared/types/player'

export type PlayerAction = 'details' | 'edit' | 'condition' | 'delete' | 'buy'

export function PlayersPage() {
  const [purchaseResult, setPurchaseResult] = useState<PlayerPurchase | null>(
    null,
  )
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<{
    type: PlayerAction
    player: Player
  } | null>(null)
  const [feedback, setFeedback] = useState<{
    title: string
    description?: string
  } | null>(null)

  function finishAction(title: string, description?: string) {
    setFeedback({ title, description })
    setIsCreateModalOpen(false)
    setSelectedAction(null)
  }

  // Cada operação mantém seu próprio erro e só fecha o modal após sucesso e atualização dos dados.
  const create = usePlayerMutation(createPlayer, (player) =>
    finishAction(
      `${player.name} cadastrado com sucesso.`,
      `Overall: ${player.overall} · Valor base: ${formatMoney(player.base_value)} moedas.`,
    ),
  )
  const edit = usePlayerMutation(updatePlayer, (player) =>
    finishAction(`${player.name} atualizado com sucesso.`),
  )
  const condition = usePlayerMutation(updatePlayerCondition, (player) =>
    finishAction(
      `Condição de ${player.name} atualizada para ${PLAYER_CONDITIONS[player.condition]}.`,
    ),
  )
  const deletion = usePlayerMutation(deletePlayer, () =>
    finishAction('Jogador excluído com sucesso.'),
  )
  const purchase = usePlayerMutation(buyPlayer, (result) => {
    finishAction(`${result.player_name} contratado com sucesso.`)
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

  function handlePlayerAction(type: PlayerAction, player: Player) {
    if (isSubmitting) return
    resetErrors()
    setFeedback(null)
    setPurchaseResult(null)
    setIsCreateModalOpen(false)
    setSelectedAction({ type, player })
  }

  function changeCreateModalOpen(open: boolean) {
    if (isSubmitting) return
    if (open) {
      resetErrors()
      setFeedback(null)
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
        icon={<IconPlaceholder />}
        title="Jogadores"
        description="Gerencie os jogadores e acompanhe o mercado da liga."
        actions={
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => changeCreateModalOpen(true)}
          >
            <IconPlaceholder />
            Cadastrar jogador
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
        <PlayersTable onPlayerAction={handlePlayerAction} />
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
          onConfirm={(player) => deletion.submit(player.id)}
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
