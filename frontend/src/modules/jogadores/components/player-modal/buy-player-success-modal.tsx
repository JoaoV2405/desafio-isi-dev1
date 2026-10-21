import { useNavigate } from '@tanstack/react-router'
import type { PlayerPurchase } from '../../types/player-purchase'
import { OperationSuccessModal } from '@/components/modal/operation-success-modal'
import { formatMoney } from '@/shared/lib/format-money'
import { formatDateTime } from '@/shared/lib/format-date-time'

interface BuyPlayerSuccessModalProps {
  purchase: PlayerPurchase
  onOpenChange: (open: boolean) => void
}

export function BuyPlayerSuccessModal({
  purchase,
  onOpenChange,
}: BuyPlayerSuccessModalProps) {
  const navigate = useNavigate()
  return (
    <OperationSuccessModal
      open
      onOpenChange={onOpenChange}
      title="Compra realizada"
      subtitle={`${purchase.player_name} contratado com sucesso.`}
      details={[
        {
          label: 'Valor da compra',
          value: `${formatMoney(purchase.value)} moedas`,
        },
        { label: 'Taxa', value: `${formatMoney(purchase.fee)} moedas` },
        {
          label: 'Custo total',
          value: `${formatMoney(purchase.value + purchase.fee)} moedas`,
        },
        {
          label: 'Fim da fidelidade',
          value: formatDateTime(purchase.contract.loyalty_until),
        },
        {
          label: 'Novo caixa do clube',
          value: `${formatMoney(purchase.club_cash)} moedas`,
        },
      ]}
      primaryAction={{
        label: 'Ver clube',
        onClick: () =>
          void navigate({
            to: '/mercado/clubes/$clubeId',
            params: { clubeId: String(purchase.club_id) },
          }),
      }}
    />
  )
}
