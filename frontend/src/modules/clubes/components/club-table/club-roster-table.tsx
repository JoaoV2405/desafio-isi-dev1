import { useMemo } from 'react'
import type { ClubPlayer } from '../../types/club-details'
import { createClubRosterColumns } from './club-roster-columns'
import { DataTable } from '@/components/data-table/data-table'

interface ClubRosterTableProps {
  players: ClubPlayer[]
  onSellPlayer: (player: ClubPlayer) => void
  isSubmitting: boolean
}

export function ClubRosterTable({
  players,
  onSellPlayer,
  isSubmitting,
}: ClubRosterTableProps) {
  const columns = useMemo(
    () => createClubRosterColumns(onSellPlayer, isSubmitting),
    [onSellPlayer, isSubmitting],
  )
  return (
    <DataTable
      contained
      className="rounded-none border-0"
      data={players}
      columns={columns}
      getRowId={(player) => String(player.id)}
      caption={<span className="sr-only">Elenco do clube</span>}
      emptyMessage="Nenhum jogador no elenco."
    />
  )
}
