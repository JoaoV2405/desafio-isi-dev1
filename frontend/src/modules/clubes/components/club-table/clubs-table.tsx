import { useClubs } from '../../hooks/use-clubs'
import { clubColumns } from './club-columns'
import { ClubsHeader } from '../clubs-header'
import { DataTable } from '@/components/data-table/data-table'
import { ContentState } from '@/components/custom/content-state'
import { ContentErrorState } from '@/components/custom/content-error-state'

export function ClubsTable({ onCreateClub }: { onCreateClub: () => void }) {
  // Preserva a ordem recebida, sem oferecer parâmetros que a API atual não suporta.
  const { data, isPending, isError, error } = useClubs()

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
      toolbar={<ClubsHeader total={data?.length} />}
    />
  )
}
