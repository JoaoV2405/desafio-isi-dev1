import type { ColumnDef } from '@tanstack/react-table'
import type { PlayerActionsMenuProps } from '../player-actions-menu'
import { PlayerActionsMenu } from '../player-actions-menu'
import type { ClubSummary } from '@/shared/types/club'
import type { Player } from '@/shared/types/player'
import { AgilityIndicator } from '@/shared/components/agility-indicator'
import { ClubIdentity } from '@/shared/components/club-identity'
import { createPlayerSummaryColumns } from '@/shared/components/player-summary-columns'
import { formatMoney } from '@/shared/lib/format-money'

export function createPlayerColumns({
  clubs,
  onBuyPlayer,
  onPlayerAction,
}: {
  clubs: ClubSummary[]
  onBuyPlayer?: (player: Player) => void
  onPlayerAction?: PlayerActionsMenuProps['onAction']
}): ColumnDef<Player>[] {
  const clubById = new Map(clubs.map((club) => [club.id, club]))
  const summaryColumns = createPlayerSummaryColumns<Player>()

  return [
    summaryColumns.name,
    summaryColumns.position,
    summaryColumns.overall,
    {
      accessorKey: 'agility',
      header: 'Agilidade',
      cell: ({ row }) => <AgilityIndicator value={row.original.agility} />,
    },
    { accessorKey: 'age', header: 'Idade' },
    summaryColumns.condition,
    {
      accessorKey: 'base_value',
      header: 'Valor base',
      cell: ({ row }) => formatMoney(row.original.base_value),
    },
    summaryColumns.market_value,
    {
      accessorKey: 'club_id',
      header: 'Clube',
      cell: ({ row }) => {
        const player = row.original
        const club =
          player.club_id === null
            ? null
            : (clubById.get(player.club_id) ?? {
                id: player.club_id,
                name: `Clube ${player.club_id}`,
                acronym: '—',
              })

        return (
          <ClubIdentity
            club={club}
            onBuy={onBuyPlayer ? () => onBuyPlayer(player) : undefined}
          />
        )
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => (
        <PlayerActionsMenu
          player={row.original}
          onAction={(action, player) => onPlayerAction?.(action, player)}
        />
      ),
    },
  ]
}
