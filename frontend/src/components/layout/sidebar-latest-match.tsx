import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Swords } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMatches } from '@/modules/partidas/hooks/use-matches'
import { RoutePaths } from '@/router/route-paths'
import { formatDateTime } from '@/shared/lib/format-date-time'

export function SidebarLatestMatch() {
  // A consulta sem filtro é compartilhada com Partidas e Classificação.
  const matches = useMatches()
  const latest = matches.data?.[0]

  return (
    <section aria-label="Último jogo" className="space-y-2 border-t pt-3">
      <h2 className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Swords aria-hidden="true" className="size-4" />
        Último jogo
      </h2>
      {latest ? (
        <Link
          to={RoutePaths.match}
          params={{ partidaId: String(latest.id) }}
          aria-label={`Ver duelos: ${latest.home.club_name} ${latest.home.goals} a ${latest.away.goals} ${latest.away.club_name}`}
          className="block space-y-2 rounded-md p-1 text-xs outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
            <span className="wrap-anywhere">{latest.home.club_name}</span>
            <span className="whitespace-nowrap font-semibold tabular-nums">
              {latest.home.goals} x {latest.away.goals}
            </span>
            <span className="text-right wrap-anywhere">
              {latest.away.club_name}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 text-muted-foreground">
            <time dateTime={latest.played_at}>
              {formatDateTime(latest.played_at)}
            </time>
            <ArrowUpRight aria-hidden="true" className="size-3 shrink-0" />
          </div>
        </Link>
      ) : matches.isPending ? (
        <p role="status" className="text-xs text-muted-foreground">
          Carregando último jogo...
        </p>
      ) : !matches.isError ? (
        <p className="text-xs text-muted-foreground">
          Nenhuma partida realizada.
        </p>
      ) : null}
      {matches.isError && (
        <div className="space-y-1">
          <p
            role="alert"
            className="text-xs whitespace-pre-line text-destructive"
          >
            {latest && 'Não foi possível atualizar o último jogo. '}
            {matches.error.message}
          </p>
          <Button
            variant="ghost"
            size="xs"
            disabled={matches.isFetching}
            onClick={() => void matches.refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      )}
    </section>
  )
}
