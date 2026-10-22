import { HandCoins, ShoppingCart } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { ClubTransaction } from '../../types/club-transactions'
import { SignedMoney } from './signed-money'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/shared/lib/format-date-time'
import { formatMoney } from '@/shared/lib/format-money'
import {
  getPlayerAvatarClassName,
  getPlayerInitials,
} from '@/shared/lib/player-presentation'

export const transactionColumns: ColumnDef<ClubTransaction>[] = [
  {
    accessorKey: 'created_at',
    header: 'Data e hora',
    cell: ({ row }) => (
      <time dateTime={row.original.created_at}>
        {formatDateTime(row.original.created_at)}
      </time>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.type === 'COMPRA' ? (
          <ShoppingCart aria-hidden="true" />
        ) : (
          <HandCoins aria-hidden="true" />
        )}
        {row.original.type === 'COMPRA' ? 'Compra' : 'Venda'}
      </Badge>
    ),
  },
  {
    accessorKey: 'player_name',
    header: 'Jogador',
    cell: ({ row: { original: transaction } }) => (
      <div className="flex items-center gap-3">
        <Avatar aria-hidden="true">
          <AvatarFallback
            className={getPlayerAvatarClassName(transaction.player_id)}
          >
            {getPlayerInitials(transaction.player_name)}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{transaction.player_name}</span>
      </div>
    ),
  },
  ...[
    { accessorKey: 'value', title: 'Valor' },
    { accessorKey: 'fee', title: 'Taxa ou comissão' },
    { accessorKey: 'penalty', title: 'Multa' },
  ].map(({ accessorKey, title }): ColumnDef<ClubTransaction> => ({
    accessorKey,
    header: () => <div className="text-right">{title}</div>,
    cell: ({ getValue }) => (
      <div className="text-right">{formatMoney(getValue<number>())}</div>
    ),
  })),
  {
    accessorKey: 'profit',
    header: () => <div className="text-right">Lucro</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        <SignedMoney value={row.original.profit} />
      </div>
    ),
  },
  {
    accessorKey: 'cash_change',
    header: () => <div className="text-right">Variação do caixa</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        <SignedMoney value={row.original.cash_change} />
      </div>
    ),
  },
]
