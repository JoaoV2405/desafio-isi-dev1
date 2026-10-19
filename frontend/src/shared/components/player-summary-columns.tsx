import type { ColumnDef } from '@tanstack/react-table'
import type { Player } from '@/shared/types/player'
import { PlayerConditionBadge } from './player-condition-badge'
import { PlayerIdentity } from './player-identity'
import { PlayerPositionBadge } from './player-position-badge'
import { formatMoney } from '@/shared/lib/format-money'

type PlayerSummary = Pick<
  Player,
  'name' | 'position' | 'overall' | 'condition' | 'market_value'
>

export function createPlayerSummaryColumns<
  TPlayer extends PlayerSummary,
>(): Record<keyof PlayerSummary, ColumnDef<TPlayer>> {
  return {
    name: {
      accessorKey: 'name',
      header: 'Jogador',
      cell: ({ row }) => (
        <PlayerIdentity
          name={row.original.name}
          position={row.original.position}
        />
      ),
    },
    position: {
      accessorKey: 'position',
      header: 'Posição',
      cell: ({ row }) => (
        <PlayerPositionBadge position={row.original.position} />
      ),
    },
    overall: { accessorKey: 'overall', header: 'Overall' },
    condition: {
      accessorKey: 'condition',
      header: 'Condição',
      cell: ({ row }) => (
        <PlayerConditionBadge condition={row.original.condition} />
      ),
    },
    market_value: {
      accessorKey: 'market_value',
      header: 'Valor de Mercado',
      cell: ({ row }) => formatMoney(row.original.market_value),
    },
  }
}
