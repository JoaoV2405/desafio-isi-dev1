import {
  Banknote,
  Coins,
  HeartPulse,
  Pencil,
  ShoppingCart,
  Star,
  TrendingUp,
  X,
} from 'lucide-react'
import { PLAYER_ATTRIBUTE_FIELDS } from '../lib/create-player-form'
import { usePlayer } from '../hooks/use-player'
import type { Player } from '@/shared/types/player'
import { useClubs } from '@/modules/clubes/hooks/use-clubs'
import { SummaryCard } from '@/components/custom/summary-card'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@/components/ui/table'
import { AttributeProgressRow } from '@/shared/components/attribute-progress-row'
import { AgilityIndicator } from '@/shared/components/agility-indicator'
import { PlayerIdentity } from '@/shared/components/player-identity'
import { PlayerPositionBadge } from '@/shared/components/player-position-badge'
import { PlayerConditionBadge } from '@/shared/components/player-condition-badge'
import { formatMoney } from '@/shared/lib/format-money'

interface PlayerDrawerProps {
  open: boolean
  player: Player
  onOpenChange: (open: boolean) => void
  onAction: (action: 'edit' | 'condition' | 'buy', player: Player) => void
}

export function PlayerDrawer({
  open,
  player,
  onOpenChange,
  onAction,
}: PlayerDrawerProps) {
  const {
    data: details,
    isPending,
    error,
    refetch,
    isFetching,
  } = usePlayer(player.id, open)
  const {
    data: clubs = [],
    isPending: clubsPending,
    error: clubsError,
  } = useClubs()
  // Usa a identificação da linha enquanto o endpoint de detalhe carrega os indicadores completos.
  const currentPlayer = details ?? player
  const club = clubs.find((entry) => entry.id === currentPlayer.club_id)
  const clubName =
    currentPlayer.club_id === null
      ? 'Livre'
      : (club?.name ?? `Clube ${currentPlayer.club_id}`)

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      {/* Cabeçalho e rodapé permanecem visíveis enquanto apenas o conteúdo central rola. */}
      <DrawerContent className="w-full sm:w-[34rem] [--drawer-content-height:100dvh] motion-reduce:transition-none">
        <DrawerHeader className="flex-row items-start justify-between gap-3 border-b px-6 py-5">
          <DrawerTitle className="sr-only">
            Detalhes de {currentPlayer.name}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            Valores, atributos técnicos e dados pessoais do jogador.
          </DrawerDescription>
          <PlayerIdentity
            playerId={currentPlayer.id}
            name={currentPlayer.name}
            position={currentPlayer.position}
            className="min-w-0 flex-1 items-start"
            description={
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <PlayerPositionBadge position={currentPlayer.position} />
                <PlayerConditionBadge condition={currentPlayer.condition} />
                <Badge
                  variant="secondary"
                  className="max-w-full rounded-md"
                  title={clubName}
                >
                  <span className="truncate">{clubName}</span>
                </Badge>
              </div>
            }
          />
          <DrawerClose
            aria-label="Fechar detalhes do jogador"
            render={<Button type="button" variant="ghost" size="icon-sm" />}
          >
            <X aria-hidden="true" />
          </DrawerClose>
        </DrawerHeader>

        <div
          aria-busy={isPending}
          className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5"
        >
          {isPending ? (
            <div role="status" className="space-y-6">
              <span className="sr-only">Carregando detalhes do jogador...</span>
              <div className="grid grid-cols-2 gap-3" aria-hidden="true">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-36" />
                ))}
              </div>
              <Skeleton aria-hidden="true" className="h-64" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Não foi possível carregar o jogador</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>{error.message}</p>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isFetching}
                  onClick={() => void refetch()}
                >
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Os quatro indicadores são apresentados na ordem solicitada, usando valores da API. */}
              <section
                aria-label="Resumo do jogador"
                className="grid grid-cols-2 gap-3"
              >
                <SummaryCard
                  title="Valor de mercado"
                  value={formatMoney(details.market_value)}
                  unit="moedas"
                  description="Cotação atual no mercado"
                  icon={<Coins className="size-4" />}
                />
                <SummaryCard
                  title="Valor base"
                  value={formatMoney(details.base_value)}
                  unit="moedas"
                  description="Calculado no cadastro"
                  icon={<Banknote className="size-4" />}
                />
                <SummaryCard
                  title="Overall"
                  value={details.overall}
                  description="Avaliação geral do jogador"
                  icon={<Star className="size-4" />}
                />
                <SummaryCard
                  title="Potencial"
                  value={details.potential}
                  description="Limite de evolução dos atributos"
                  icon={<TrendingUp className="size-4" />}
                />
              </section>

              <section
                aria-label="Indicadores técnicos"
                className="space-y-4 rounded-xl border bg-card p-4"
              >
                <h2 className="text-base leading-6 font-semibold">
                  Indicadores técnicos
                </h2>
                <div className="space-y-4">
                  {PLAYER_ATTRIBUTE_FIELDS.map(({ key, label }) => (
                    <AttributeProgressRow
                      key={key}
                      label={label}
                      value={details[key]}
                      potential={details.potential}
                    />
                  ))}
                </div>
                {/* As cores seguem as mesmas barras de atributo atual e potencial do cadastro. */}
                <div
                  aria-label="Legenda dos indicadores"
                  className="flex flex-wrap gap-4 text-xs text-muted-foreground"
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-2.5 rounded-sm bg-chart-1"
                    />
                    Atributo atual
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-2.5 rounded-sm bg-chart-2"
                    />
                    Potencial
                  </span>
                </div>
              </section>

              {/* Tabela simples de apresentação, sem controles de ordenação ou paginação. */}
              <div className="overflow-hidden rounded-xl border">
                <Table>
                  <caption className="sr-only">Informações do jogador</caption>
                  <TableBody>
                    <TableRow>
                      <TableHead
                        scope="row"
                        className="px-4 font-normal text-muted-foreground"
                      >
                        Idade
                      </TableHead>
                      <TableCell className="px-4 py-3 text-right">
                        {details.age} anos
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead
                        scope="row"
                        className="px-4 font-normal text-muted-foreground"
                      >
                        Agilidade
                      </TableHead>
                      <TableCell className="px-4 py-3">
                        <div className="flex justify-end">
                          <AgilityIndicator value={details.agility} />
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead
                        scope="row"
                        className="px-4 font-normal text-muted-foreground"
                      >
                        Clube
                      </TableHead>
                      <TableCell className="whitespace-normal break-words px-4 py-3 text-right">
                        {details.club_id !== null && clubsPending
                          ? 'Carregando clube...'
                          : clubName}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              {details.club_id !== null && clubsError && (
                <Alert variant="destructive">
                  <AlertDescription>{clubsError.message}</AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        {/* A página substitui os detalhes pelo modal correspondente à ação selecionada. */}
        <DrawerFooter className="grid grid-cols-1 gap-2 border-t px-6 py-4 min-[480px]:grid-cols-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onAction('edit', currentPlayer)}
          >
            <Pencil aria-hidden="true" />
            Editar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onAction('condition', currentPlayer)}
          >
            <HeartPulse aria-hidden="true" />
            Alterar condição
          </Button>
          <Button
            type="button"
            disabled={currentPlayer.club_id !== null}
            onClick={() => onAction('buy', currentPlayer)}
          >
            <ShoppingCart aria-hidden="true" />
            Comprar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
