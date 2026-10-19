import { useState } from 'react'
import type { ClubsSort } from '../types/clubs-query'
import { useClubs } from '../hooks/use-clubs'
import { clubColumns } from './club-columns'
import { ClubsHeader } from './clubs-header'
import { DataTable } from '@/components/data-table/data-table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function ClubsTable() {
  const [sort, setSort] = useState<ClubsSort>('name')
  const { data, isPending, isError, error } = useClubs({ sort })

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Não foi possível carregar os clubes</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
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
      emptyMessage="Nenhum clube encontrado."
      caption={<span className="sr-only">Clubes da liga</span>}
      toolbar={
        <ClubsHeader total={data?.length} sort={sort} onSortChange={setSort} />
      }
    />
  )
}
