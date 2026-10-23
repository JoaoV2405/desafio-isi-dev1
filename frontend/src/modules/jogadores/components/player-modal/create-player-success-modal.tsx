import type { Player } from '@/shared/types/player'
import { PLAYER_CONDITIONS } from '@/shared/types/player'
import { OperationSuccessModal } from '@/components/modal/operation-success-modal'
import { formatMoney } from '@/shared/lib/format-money'

interface CreatePlayerSuccessModalProps {
  player: Player
  onOpenChange: (open: boolean) => void
  onViewDetails: () => void
}

export function CreatePlayerSuccessModal({
  player,
  onOpenChange,
  onViewDetails,
}: CreatePlayerSuccessModalProps) {
  return (
    <OperationSuccessModal
      open
      onOpenChange={onOpenChange}
      title="Jogador cadastrado"
      subtitle={`${player.name} entrou livre e ${PLAYER_CONDITIONS[player.condition]}. Valores em moedas, calculados pela API ao salvar.`}
      details={[
        {
          label: 'Valor base',
          value: formatMoney(player.base_value),
        },
        {
          label: 'Valor de mercado',
          value: formatMoney(player.market_value),
        },
        {
          label: 'Overall',
          value: player.overall,
        },
      ]}
      primaryAction={{ label: 'Ver detalhes', onClick: onViewDetails }}
    />
  )
}
