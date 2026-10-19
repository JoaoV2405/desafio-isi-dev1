import { useCallback, useState } from 'react'
import { CreatePlayerModal } from '../components/player-modal/create-player-modal'
import {
  EditPlayerModal,
  EditPlayerConditionModal,
} from '../components/player-modal/edit-player-modal'
import { DeletePlayerModal } from '../components/player-modal/delete-player-modal'
import type { PlayerAction } from '../components/player-actions-menu'
import type { Player } from '@/shared/types/player'
import { IconPlaceholder } from '@/components/layout/icon-placeholder'
import { PageContainer } from '@/components/page/page-container'
import { PageHeader } from '@/components/page/page-header'
import { PageSection } from '@/components/page/page-section'
import { Button } from '@/components/ui/button'
import { PlayersTable } from '../components/player-table/players-table'

export function PlayersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<{
    type: PlayerAction
    player: Player
  } | null>(null)

  const handlePlayerAction = useCallback(
    (type: PlayerAction, player: Player) => {
      setIsCreateModalOpen(false)
      setSelectedAction({ type, player })
    },
    [],
  )

  function changeCreateModalOpen(open: boolean) {
    if (open && selectedAction !== null) {
      setSelectedAction(null)
    }
    setIsCreateModalOpen(open)
  }

  return (
    <PageContainer>
      <PageHeader
        icon={<IconPlaceholder />}
        title="Jogadores"
        description="Gerencie os jogadores e acompanhe o mercado da liga."
        actions={
          <Button type="button" onClick={() => changeCreateModalOpen(true)}>
            <IconPlaceholder />
            Novo jogador
          </Button>
        }
      />
      <PageSection aria-label="Jogadores">
        <PlayersTable onPlayerAction={handlePlayerAction} />
      </PageSection>
      {isCreateModalOpen && (
        <CreatePlayerModal open onOpenChange={changeCreateModalOpen} />
      )}
      {/* A ação selecionada fornece os dados atuais e desmonta o formulário ao fechar. */}
      {selectedAction?.type === 'edit' && (
        <EditPlayerModal
          key={selectedAction.player.id}
          open
          player={selectedAction.player}
          onOpenChange={(open) => {
            if (!open) setSelectedAction(null)
          }}
        />
      )}
      {/* Compartilha a ação selecionada para manter apenas um dos modais aberto por vez. */}
      {selectedAction?.type === 'condition' && (
        <EditPlayerConditionModal
          key={selectedAction.player.id}
          open
          player={selectedAction.player}
          onOpenChange={(open) => {
            if (!open) setSelectedAction(null)
          }}
        />
      )}
      {/* Reutiliza a ação selecionada para abrir a confirmação sem sobrepor outro modal. */}
      {selectedAction?.type === 'delete' && (
        <DeletePlayerModal
          open
          player={selectedAction.player}
          onOpenChange={(open) => {
            if (!open) setSelectedAction(null)
          }}
        />
      )}
    </PageContainer>
  )
}
