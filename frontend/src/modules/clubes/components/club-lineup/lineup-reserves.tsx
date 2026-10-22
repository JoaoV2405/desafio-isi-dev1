import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ClubPlayer } from '../../types/club-details'
import { Button } from '@/components/ui/button'
import { PlayerIdentity } from '@/shared/components/player-identity'
import { PlayerConditionBadge } from '@/shared/components/player-condition-badge'

interface LineupReservesProps {
  players: ClubPlayer[]
  playersPerPage?: 1 | 2
  isLoading?: boolean
  hasError?: boolean
}

export function LineupReserves({
  players,
  playersPerPage = 2,
  isLoading = false,
  hasError = false,
}: LineupReservesProps) {
  const [page, setPage] = useState(0)
  const pageCount = Math.ceil(players.length / playersPerPage)
  const currentPage = Math.min(page, Math.max(0, pageCount - 1))
  // Mantém a página válida quando o elenco ou a quantidade visível diminuem.
  if (page !== currentPage) setPage(currentPage)
  const visiblePlayers = players.slice(
    currentPage * playersPerPage,
    (currentPage + 1) * playersPerPage,
  )

  return (
    <section
      aria-label="Reservas"
      className="min-w-0 overflow-hidden rounded-xl border bg-card"
    >
      <header className="space-y-1 border-b p-4">
        <h2 className="text-lg font-semibold">Reservas</h2>
        <p className="text-sm text-muted-foreground">
          Jogadores do elenco fora da escalação
        </p>
      </header>
      {isLoading ? (
        <p role="status" className="p-4 text-sm text-muted-foreground">
          Carregando reservas...
        </p>
      ) : hasError ? (
        <p className="p-4 text-sm text-muted-foreground">
          Carregue a escalação novamente para consultar os reservas.
        </p>
      ) : players.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          Nenhum jogador no banco de reservas.
        </p>
      ) : (
        <>
          <ul aria-label="Jogadores reservas" className="divide-y">
            {visiblePlayers.map((player) => (
              <li
                key={player.id}
                title={player.name}
                className="flex min-w-0 items-center justify-between gap-2 p-4"
              >
                <PlayerIdentity
                  playerId={player.id}
                  name={player.name}
                  position={player.position}
                  description={player.position}
                  className="min-w-0 flex-1 gap-2 [&_[data-slot=avatar]]:size-7 [&_[data-slot=avatar-fallback]]:text-xs [&_p]:truncate"
                />
                <PlayerConditionBadge condition={player.condition} />
              </li>
            ))}
          </ul>
          {pageCount > 1 && (
            <nav
              aria-label="Paginação dos reservas"
              className="flex items-center justify-between gap-2 border-t p-3"
            >
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Reservas anteriores"
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <span
                role="status"
                className="text-xs text-muted-foreground tabular-nums"
              >
                {currentPage + 1} de {pageCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Próximos reservas"
                disabled={currentPage === pageCount - 1}
                onClick={() => setPage(currentPage + 1)}
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </nav>
          )}
        </>
      )}
    </section>
  )
}
