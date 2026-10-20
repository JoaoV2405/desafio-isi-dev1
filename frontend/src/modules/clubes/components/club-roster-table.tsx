import type { ClubPlayer } from '../types/club-details'
import { clubRosterColumns } from './club-roster-columns'
import { DataTable } from '@/components/data-table/data-table'

export function ClubRosterTable({ players }: { players: ClubPlayer[] }) {
  return (
    <DataTable
      contained
      className="rounded-none border-0"
      data={players}
      columns={clubRosterColumns}
      getRowId={(player) => String(player.id)}
      caption={<span className="sr-only">Elenco do clube</span>}
      emptyMessage="Nenhum jogador no elenco."
    />
  )
}
