import { useState } from 'react'
import { useClubs } from '../../hooks/use-clubs'
import type { ClubsSort } from '../../types/clubs-query'
import { clubColumns } from './club-columns'
import { DataTable } from '@/components/data-table/data-table'
import { ContentState } from '@/components/custom/content-state'
import { ContentErrorState } from '@/components/custom/content-error-state'
import { Badge } from '@/components/ui/badge'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

export function ClubsTable({ onCreateClub }: { onCreateClub: () => void }) {
  const [sort, setSort] = useState<ClubsSort>('name')
  const { data, isPending, isError, error } = useClubs(sort)

  if (isError) {
    return (
      <div className="overflow-hidden rounded-xl border bg-card">
        <ContentErrorState
          title="Não foi possível carregar os clubes"
          error={error}
        />
      </div>
    )
  }

  return (
    <DataTable
      contained
      data={data ?? []}
      columns={clubColumns}
      getRowId={(club) => String(club.id)}
      isLoading={isPending}
      loadingMessage="Carregando clubes..."
      emptyContent={
        <ContentState
          variant="empty"
          title="Nenhum clube cadastrado"
          description="Crie o primeiro clube para começar a organizar a liga."
          action={{ label: 'Criar clube', onClick: onCreateClub }}
        />
      }
      caption={<span className="sr-only">Clubes da liga</span>}
      toolbar={
        <ClubsHeader total={data?.length} sort={sort} onSortChange={setSort} />
      }
    />
  )
}

function ClubsHeader({
  total,
  sort,
  onSortChange,
}: {
  total: number | undefined
  sort: ClubsSort
  onSortChange: (sort: ClubsSort) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3" aria-live="polite">
        <p className="text-sm font-medium">
          {total === undefined ? 'Carregando clubes...' : `${total} clubes`}
        </p>
        {total !== undefined && (
          <Badge variant="secondary" className="rounded-md tabular-nums">
            {total} clubes de 20
          </Badge>
        )}
      </div>
      <label className="ml-auto flex flex-wrap items-center gap-2 text-sm font-medium">
        <span>Ordenar por</span>
        <NativeSelect
          aria-label="Ordenar clubes"
          value={sort}
          onChange={(event) => {
            const value = event.target.value
            if (
              value === 'name' ||
              value === 'net_worth_desc' ||
              value === 'net_worth_asc'
            ) {
              onSortChange(value)
            }
          }}
        >
          <NativeSelectOption value="name">Nome</NativeSelectOption>
          <NativeSelectOption value="net_worth_desc">
            Patrimônio: maior primeiro
          </NativeSelectOption>
          <NativeSelectOption value="net_worth_asc">
            Patrimônio: menor primeiro
          </NativeSelectOption>
        </NativeSelect>
      </label>
    </div>
  )
}
