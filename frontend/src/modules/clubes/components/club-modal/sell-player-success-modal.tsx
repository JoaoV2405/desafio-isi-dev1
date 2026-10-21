import type { PlayerSale } from '../../types/player-sale'
import { OperationSuccessModal } from '@/components/modal/operation-success-modal'
import { formatMoney } from '@/shared/lib/format-money'

interface SellPlayerSuccessModalProps {
  sale: PlayerSale
  onOpenChange: (open: boolean) => void
  onViewHistory: () => void
}

export function SellPlayerSuccessModal({
  sale,
  onOpenChange,
  onViewHistory,
}: SellPlayerSuccessModalProps) {
  return (
    <OperationSuccessModal
      open
      onOpenChange={onOpenChange}
      title="Venda realizada"
      subtitle={`${sale.player_name} vendido com sucesso.`}
      details={[
        {
          label: 'Valor de compra',
          value: `${formatMoney(sale.purchase_value)} moedas`,
        },
        { label: 'Valor de venda', value: `${formatMoney(sale.value)} moedas` },
        { label: 'Dias restantes de fidelidade', value: sale.remaining_days },
        { label: 'Percentual da multa', value: `${sale.penalty_rate}%` },
        { label: 'Multa', value: `${formatMoney(sale.penalty)} moedas` },
        { label: 'Lucro', value: `${formatMoney(sale.profit)} moedas` },
        { label: 'Comissão', value: `${formatMoney(sale.fee)} moedas` },
        {
          label: 'Crédito recebido',
          value: `${formatMoney(sale.cash_change)} moedas`,
        },
        {
          label: 'Situação do contrato',
          value:
            sale.contract_status === 'RESCINDIDO' ? 'Rescindido' : 'Encerrado',
        },
        {
          label: 'Novo caixa do clube',
          value: `${formatMoney(sale.club_cash)} moedas`,
        },
      ]}
      primaryAction={{ label: 'Ver histórico', onClick: onViewHistory }}
    />
  )
}
