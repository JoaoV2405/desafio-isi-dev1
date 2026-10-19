import { Ellipsis } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { ClubSummary } from '@/shared/types/club'
import type { Player } from '@/shared/types/player'
import { Button } from '@/components/ui/button'
import { AgilityIndicator } from '@/shared/components/agility-indicator'
import { ClubIdentity } from '@/shared/components/club-identity'
import { PlayerConditionBadge } from '@/shared/components/player-condition-badge'
import { PlayerIdentity } from '@/shared/components/player-identity'
import { PlayerPositionBadge } from '@/shared/components/player-position-badge'
import { formatMoney } from '@/shared/lib/format-money'

export function createPlayerColumns({
  clubs,
  onBuyPlayer,
}: {
  clubs: ClubSummary[]
  onBuyPlayer?: (player: Player) => void
}): ColumnDef<Player>[] {
  const clubById = new Map(clubs.map((club) => [club.id, club]))

  return [
    {
      accessorKey: 'name',
      header: 'Jogador',
      cell: ({ row }) => (
        <PlayerIdentity
          name={row.original.name}
          position={row.original.position}
        />
      ),
    },
    {
      accessorKey: 'position',
      header: 'Posição',
      cell: ({ row }) => (
        <PlayerPositionBadge position={row.original.position} />
      ),
    },
    { accessorKey: 'overall', header: 'Overall' },
    {
      accessorKey: 'agility',
      header: 'Agilidade',
      cell: ({ row }) => <AgilityIndicator value={row.original.agility} />,
    },
    { accessorKey: 'age', header: 'Idade' },
    {
      accessorKey: 'condition',
      header: 'Condição',
      cell: ({ row }) => (
        <PlayerConditionBadge condition={row.original.condition} />
      ),
    },
    {
      accessorKey: 'base_value',
      header: 'Valor base',
      cell: ({ row }) => formatMoney(row.original.base_value),
    },
    {
      accessorKey: 'market_value',
      header: 'Valor Mercado',
      cell: ({ row }) => formatMoney(row.original.market_value),
    },
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
      // TODO: menu com quatro opções; a composição será definida depois.
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled
          aria-label={`Ações de ${row.original.name}`}
        >
          <Ellipsis />
        </Button>
      ),
    },
  ]
}
