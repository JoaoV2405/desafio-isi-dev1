import type { Player } from '@/shared/types/player'
import { Modal } from '@/components/modal/modal'
import { Badge } from '@/components/ui/badge'
import { PlayerIdentity } from '@/shared/components/player-identity'

interface DeletePlayerModalProps {
  open: boolean
  player: Player
  onOpenChange: (open: boolean) => void
  onConfirm: (player: Player) => void
  isSubmitting?: boolean
  error?: string
}

export function DeletePlayerModal({
  open,
  player,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  error,
}: DeletePlayerModalProps) {
  const isFree = player.club_id === null

  // A confirmação usa um callback; a operação e seu estado de envio ficam na camada de integração.
  function confirmDelete() {
    if (isFree && !isSubmitting) onConfirm(player)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Excluir jogador"
      subtitle="Tem certeza de que deseja excluir este jogador?"
      primaryAction={{
        label: 'Excluir jogador',
        pendingLabel: 'Excluindo...',
        variant: 'destructive',
        onClick: confirmDelete,
        // A exclusão só é permitida para jogadores livres.
        disabled: !isFree,
      }}
      isSubmitting={isSubmitting}
    >
      {/* Identifica o jogador e mantém o vínculo à direita, fora do bloco de texto. */}
      <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
        <PlayerIdentity
          name={player.name}
          position={player.position}
          age={player.age}
          className="min-w-0 flex-1"
        />
        <Badge variant="secondary" className="ml-auto rounded-md">
          {isFree ? 'Livre' : 'Vinculado'}
        </Badge>
      </div>
      {!isFree && (
        <p role="alert" className="text-sm text-destructive">
          Apenas jogadores livres podem ser excluídos.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="whitespace-pre-line text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </Modal>
  )
}
