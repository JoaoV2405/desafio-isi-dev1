import { DataTable } from '@/components/data-table/data-table'
import { ContentErrorState } from '@/components/custom/content-error-state'
import { useStandings } from '../hooks/use-standings'
import type { Standings } from '../hooks/use-standings'
import type { ColumnDef } from '@tanstack/react-table'
import { useClubs } from '@/modules/clubes/hooks/use-clubs'
import type { ClubSummary } from '@/shared/types/club'
import { Link } from '@tanstack/react-router'
import { RoutePaths } from '#/router/route-paths'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface Standing extends Standings {
  club: ClubSummary
}

export const standingColumns: ColumnDef<Standing>[] = [
  {
    accessorKey: 'position',
    header: '#',
    cell: ({ row }) => (
      <span
        className={cn(
          'inline-flex size-7 items-center justify-center rounded-md font-medium tabular-nums',
          row.original.position === 1
            ? 'bg-primary-soft text-primary'
            : 'bg-muted text-muted-foreground',
        )}
      >
        {row.original.position}
      </span>
    ),
  },
  {
    accessorKey: 'club_name',
    header: 'Clube',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="rounded-md">
          {row.original.club.acronym}
        </Badge>
        <Link
          to={RoutePaths.club}
          params={{ clubeId: String(row.original.club_id) }}
          className="underline underline-offset-4"
        >
          {row.original.club_name}
        </Link>
      </div>
    ),
  },
  { accessorKey: 'played', header: 'J' },
  { accessorKey: 'wins', header: 'V' },
  { accessorKey: 'draws', header: 'E' },
  { accessorKey: 'losses', header: 'D' },
  { accessorKey: 'goals_for', header: 'GP' },
  { accessorKey: 'goals_against', header: 'GC' },
  { accessorKey: 'goal_difference', header: 'SG' },
  { accessorKey: 'points', header: 'Pts' },
]
export function StandingFooter() {
  return (
    <p className="text-xs text-muted-foreground">
      #: Posição · J: Jogos · V: Vitórias · E: Empates · D: Derrotas · GP: Gols
      pró · GC: Gols contra · SG: Saldo de gols · Pts: Pontos
    </p>
  )
}
export function StandingsTable() {
  // Preserva a ordem recebida, sem oferecer parâmetros que a API atual não suporta.
  const { data, isPending, isError, error } = useStandings()
  const { data: clubs } = useClubs()
  const standingsWithClubs: Standing[] = (data ?? []).map((standing) => ({
    ...standing,
    club: {
      id: standing.club_id,
      name: standing.club_name,
      acronym:
        clubs?.find((club) => club.id === standing.club_id)?.acronym ?? '—',
    },
  }))

  if (isError) {
    return (
      <div className="overflow-hidden rounded-xl border bg-card">
        <ContentErrorState
          title="Não foi possível carregar a classificação"
          error={error}
        />
      </div>
    )
  }

  return (
    <DataTable
      contained
      data={standingsWithClubs}
      columns={standingColumns}
      getRowId={(standing) => String(standing.club_id)}
      isLoading={isPending}
      loadingMessage="Carregando classificação..."
      emptyMessage="Nenhum clube na classificação."
      caption={<span className="sr-only">Classificação da liga</span>}
      footer={<StandingFooter />}
      className="
        [&_th:nth-child(2)]:w-full
        [&_td:nth-child(2)]:w-full
        [&_th]:whitespace-nowrap
        [&_td]:whitespace-nowrap
        "
    />
  )
}
