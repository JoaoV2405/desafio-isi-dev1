import type { ColumnDef } from '@tanstack/react-table'
import type { ClubPlayer } from '../types/club-details'
import { PenaltyRateBadge } from './penalty-rate-badge'
import { Button } from '@/components/ui/button'
import { createPlayerSummaryColumns } from '@/shared/components/player-summary-columns'
import { formatMoney } from '@/shared/lib/format-money'
import { formatDateTime } from '@/shared/lib/format-date-time'

const daysFormatter = new Intl.NumberFormat('pt-BR')
const summaryColumns = createPlayerSummaryColumns<ClubPlayer>()

export function createClubRosterColumns(
  onSellPlayer: (player: ClubPlayer) => void,
  isSubmitting: boolean,
): ColumnDef<ClubPlayer>[] {
  return [
    summaryColumns.name,
    summaryColumns.position,
    summaryColumns.overall,
    summaryColumns.condition,
    summaryColumns.market_value,
    {
      id: 'purchase_value',
      header: 'Valor de compra',
      cell: ({ row }) => formatMoney(row.original.contract.purchase_value),
    },
    {
      id: 'loyalty_until',
      header: 'Fim da fidelidade',
      cell: ({ row }) => {
        const loyaltyUntil = row.original.contract.loyalty_until
        return (
          <time dateTime={loyaltyUntil}>{formatDateTime(loyaltyUntil)}</time>
        )
      },
    },
    {
      id: 'remaining_days',
      header: 'Dias restantes',
      cell: ({ row }) => {
        const days = row.original.contract.remaining_days
        return `${daysFormatter.format(days)} ${days === 1 ? 'dia' : 'dias'}`
      },
    },
    {
      id: 'penalty_rate',
      header: '% da multa',
      cell: ({ row }) => (
        <PenaltyRateBadge rate={row.original.contract.penalty_rate} />
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => (
        // A linha solicita a abertura do modal; a página confirma a venda.
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={`Vender ${row.original.name}`}
          disabled={isSubmitting}
          onClick={() => onSellPlayer(row.original)}
        >
          Vender
        </Button>
      ),
    },
  ]
}
