import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Club } from '@/shared/types/club'
import { Button } from '@/components/ui/button'
import { RoutePaths } from '@/router/route-paths'
import { ClubIdentity } from '@/shared/components/club-identity'
import { formatMoney } from '@/shared/lib/format-money'

export const clubColumns: ColumnDef<Club>[] = [
  {
    accessorKey: 'name',
    header: 'Clube',
    cell: ({ row }) => <ClubIdentity club={row.original} />,
  },
  { accessorKey: 'acronym', header: 'Sigla' },
  {
    accessorKey: 'cash',
    header: 'Caixa',
    cell: ({ row }) => formatMoney(row.original.cash),
  },
  {
    accessorKey: 'squad_value',
    header: 'Valor do elenco',
    cell: ({ row }) => formatMoney(row.original.squad_value),
  },
  {
    accessorKey: 'net_worth',
    header: 'Patrimônio',
    cell: ({ row }) => formatMoney(row.original.net_worth),
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Ações</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          aria-label={`Ver clube ${row.original.name}`}
          render={
            <Link
              to={RoutePaths.club}
              params={{ clubeId: String(row.original.id) }}
            />
          }
        >
          Ver clube
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    ),
  },
]
