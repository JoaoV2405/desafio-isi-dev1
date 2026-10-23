import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { MatchSummary } from '../services/matches-api'
import { useMatches } from '../hooks/use-matches'
import { MatchClubFilter } from './match-club-filter'
import { MatchDuelsLink, MatchResultBadge } from './match-result'
import { ContentErrorState } from '@/components/custom/content-error-state'
import { DataTable } from '@/components/data-table/data-table'
import { formatDateTime } from '@/shared/lib/format-date-time'
import { cn } from '@/lib/utils'
import './matches-history.css'

const matchColumns: ColumnDef<MatchSummary>[] = [
  {
    accessorKey: 'played_at',
    header: 'Data e hora',
    cell: ({ row }) => {
      const [date, time] = formatDateTime(row.original.played_at).split(' ')
      return (
        <time dateTime={row.original.played_at} className="inline-flex gap-2">
          <span>{date}</span>
          <span className="text-muted-foreground">{time}</span>
        </time>
      )
    },
  },
  {
    accessorKey: 'home.club_name',
    header: 'Mandante',
    cell: ({ row }) => (
      <span className={cn(row.original.result === 'MANDANTE' && 'font-bold')}>
        {row.original.home.club_name}
      </span>
    ),
  },
  {
    id: 'score',
    header: 'Placar',
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">
        {row.original.home.goals} x {row.original.away.goals}
      </span>
    ),
  },
  {
    accessorKey: 'away.club_name',
    header: 'Visitante',
    cell: ({ row }) => (
      <span className={cn(row.original.result === 'VISITANTE' && 'font-bold')}>
        {row.original.away.club_name}
      </span>
    ),
  },
  {
    accessorKey: 'result',
    header: 'Resultado',
    cell: ({ row }) => <MatchResultBadge result={row.original.result} />,
  },
  {
    id: 'actions',
    header: 'Duelos',
    cell: ({ row }) => <MatchDuelsLink match={row.original} />,
  },
]

export function MatchesHistory() {
  const [clubId, setClubId] = useState<number | null>(null)
  const { data, isPending, isError, error } = useMatches(clubId)

  return (
    <section
      aria-labelledby="matches-history-title"
      className="overflow-hidden rounded-xl border bg-card"
    >
      <header className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
        <div className="space-y-1">
          <h2 id="matches-history-title" className="text-base font-semibold">
            Histórico de partidas
          </h2>
          <p className="text-xs text-muted-foreground">
            Da mais recente para a mais antiga
          </p>
        </div>
        <MatchClubFilter clubId={clubId} onClubChange={setClubId} />
      </header>
      {isError ? (
        <ContentErrorState
          title="Não foi possível carregar o histórico de partidas"
          error={error}
        />
      ) : (
        <DataTable
          contained
          data={data ?? []}
          columns={matchColumns}
          getRowId={(match) => String(match.id)}
          isLoading={isPending}
          loadingMessage="Carregando partidas..."
          emptyMessage={
            clubId === null
              ? 'Nenhuma partida realizada.'
              : 'Nenhuma partida encontrada para este clube.'
          }
          className="matches-history-table rounded-none border-0"
        />
      )}
      <footer className="border-t px-5 py-4">
        <p className="text-xs text-muted-foreground" role="status">
          {isPending || isError ? '—' : data.length} partidas
        </p>
      </footer>
    </section>
  )
}
