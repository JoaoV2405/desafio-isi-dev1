import type { ColumnDef } from '@tanstack/react-table'
import type { ClubPlayer } from '../types/club-details'
import { PenaltyRateBadge } from './penalty-rate-badge'
import { Button } from '@/components/ui/button'
import { createPlayerSummaryColumns } from '@/shared/components/player-summary-columns'
import { formatMoney } from '@/shared/lib/format-money'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})
const summaryColumns = createPlayerSummaryColumns<ClubPlayer>()

export const clubRosterColumns: ColumnDef<ClubPlayer>[] = [
  summaryColumns.name,
  summaryColumns.position,
  summaryColumns.overall,
  summaryColumns.condition,
  summaryColumns.market_value,
  {
    id: 'purchase_value',
    header: 'Valor de Compra',
    cell: ({ row }) => formatMoney(row.original.contract.purchase_value),
  },
  {
    id: 'loyalty_until',
    header: 'Fim da Fidelidade',
    cell: ({ row }) => {
      const loyaltyUntil = row.original.contract.loyalty_until
      const date = new Date(loyaltyUntil)
      return (
        <time dateTime={loyaltyUntil} className="inline-flex flex-col gap-0.5">
          <span>{dateFormatter.format(date)}</span>
          <span className="text-xs text-muted-foreground">
            {timeFormatter.format(date)}
          </span>
        </time>
      )
    },
  },
  {
    id: 'remaining_days',
    header: 'Dias restantes',
    cell: ({ row }) => row.original.contract.remaining_days,
  },
  {
    id: 'penalty_rate',
    header: '% da Multa',
    cell: ({ row }) => (
      <PenaltyRateBadge rate={row.original.contract.penalty_rate} />
    ),
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Ações</span>,
    cell: ({ row }) => (
      // TODO: abrir a confirmação de venda na próxima etapa.
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={`Vender ${row.original.name}`}
      >
        Vender
      </Button>
    ),
  },
]
