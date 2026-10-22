import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { X } from 'lucide-react'
import type {
  PlayersFilterValues,
  PlayersScope,
  PlayersSort,
} from '../../types/players-query'
import { DEFAULT_PLAYER_FILTERS } from '../../types/players-query'
import { usePlayers } from '../../hooks/use-players'
import { createPlayerColumns } from './player-columns'
import type { PlayerActionsMenuProps } from '../player-actions-menu'
import { PlayersFilters } from './players-filters'
import { PlayersTableHeader } from './players-table-header'
import { DataTable } from '@/components/data-table/data-table'
import { TablePagination } from '@/components/data-table/table-pagination'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { formatMoney } from '@/shared/lib/format-money'
import { PLAYER_CONDITIONS, PLAYER_POSITIONS } from '@/shared/types/player'
import type { Club } from '@/shared/types/club'
import { useClubs } from '@/modules/clubes/hooks/use-clubs'
import { ContentState } from '@/components/custom/content-state'
import { ContentErrorState } from '@/components/custom/content-error-state'

const PAGE_SIZE = 10
const EMPTY_CLUBS: Club[] = []

interface PlayersTableProps {
  onPlayerAction?: PlayerActionsMenuProps['onAction']
  onCreatePlayer: () => void
}

export function PlayersTable({
  onPlayerAction,
  onCreatePlayer,
}: PlayersTableProps) {
  // Centraliza os filtros e observa alterações para manter consulta e indicadores sincronizados.
  const { register, control, setValue, reset } = useForm<PlayersFilterValues>({
    defaultValues: DEFAULT_PLAYER_FILTERS,
  })
  const filters = { ...DEFAULT_PLAYER_FILTERS, ...useWatch({ control }) }
  const [scope, setScope] = useState<PlayersScope>('all')
  const [sort, setSort] = useState<PlayersSort>('name')
  const [page, setPage] = useState(1)
  // Nomes e opções de clube vêm da mesma consulta usada no restante da interface.
  const {
    data: clubs = EMPTY_CLUBS,
    isPending: clubsPending,
    error: clubsError,
  } = useClubs()
  const columns = useMemo(
    () =>
      createPlayerColumns({
        clubs,
        onPlayerAction,
        onBuyPlayer: onPlayerAction
          ? (player) => onPlayerAction('buy', player)
          : undefined,
      }),
    [clubs, onPlayerAction],
  )
  const search = filters.search.trim()
  const filterLabels: Record<keyof PlayersFilterValues, string> = {
    search: search.length >= 2 ? `Busca: ${search}` : '',
    position: filters.position
      ? `Posição: ${PLAYER_POSITIONS[filters.position]}`
      : '',
    condition: filters.condition
      ? `Condição: ${PLAYER_CONDITIONS[filters.condition]}`
      : '',
    clubId: filters.clubId
      ? `Clube: ${clubs.find((club) => String(club.id) === filters.clubId)?.name ?? filters.clubId}`
      : '',
    minAge: filters.minAge ? `Idade mínima: ${filters.minAge}` : '',
    maxAge: filters.maxAge ? `Idade máxima: ${filters.maxAge}` : '',
    minValue: filters.minValue
      ? `Valor mínimo: ${formatMoney(Number(filters.minValue))}`
      : '',
    maxValue: filters.maxValue
      ? `Valor máximo: ${formatMoney(Number(filters.maxValue))}`
      : '',
  }
  const activeFilters = (
    Object.entries(filterLabels) as [keyof PlayersFilterValues, string][]
  ).filter(([, label]) => label)
  const hasActiveFilters = activeFilters.length > 0 || scope !== 'all'
  const { data, isPending, isError, error } = usePlayers({
    page,
    limit: PAGE_SIZE,
    sort,
    search: search.length >= 2 ? search : undefined,
    free: scope === 'all' ? undefined : scope === 'free',
    position: filters.position || undefined,
    condition: filters.condition || undefined,
    club_id: filters.clubId ? Number(filters.clubId) : undefined,
    min_age: filters.minAge ? Number(filters.minAge) : undefined,
    max_age: filters.maxAge ? Number(filters.maxAge) : undefined,
    min_value: filters.minValue ? Number(filters.minValue) : undefined,
    max_value: filters.maxValue ? Number(filters.maxValue) : undefined,
  })

  // A exclusão do último item de uma página pode reduzir a quantidade de páginas da consulta.
  useEffect(() => {
    if (data && page > Math.max(1, data.meta.total_pages)) {
      setPage(Math.max(1, data.meta.total_pages))
    }
  }, [data, page])

  // Limpa um campo pelo formulário para atualizar também o controle exibido na tela.
  function removeFilter(key: keyof PlayersFilterValues) {
    setValue(key, '')
    setPage(1)
  }

  function changeScope(nextScope: PlayersScope) {
    setScope(nextScope)
    // Mantém a incompatibilidade entre clube selecionado e a aba de jogadores livres.
    if (nextScope === 'free') setValue('clubId', '')
    setPage(1)
  }

  function changeSort(nextSort: PlayersSort) {
    setSort(nextSort)
    setPage(1)
  }

  function clearFilters() {
    // reset restaura todos os controles e o estado interno dos filtros de uma vez.
    reset(DEFAULT_PLAYER_FILTERS)
    setScope('all')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <PlayersFilters
        register={register}
        onFilterChange={() => setPage(1)}
        scope={scope}
        clubs={clubs}
        clubsLoading={clubsPending}
        clubsUnavailable={Boolean(clubsError)}
      />
      {clubsError && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível carregar os clubes</AlertTitle>
          <AlertDescription>{clubsError.message}</AlertDescription>
        </Alert>
      )}
      {hasActiveFilters && (
        <div
          aria-label="Filtros ativos"
          className="flex items-center gap-4 border-b pb-4"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
            {activeFilters.map(([key, label]) => (
              <span
                key={key}
                className="inline-flex shrink-0 items-center gap-1 rounded-md bg-muted py-1 pr-1 pl-3 text-sm"
              >
                {label}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remover filtro ${label}`}
                  onClick={() => removeFilter(key)}
                >
                  <X aria-hidden="true" />
                </Button>
              </span>
            ))}
            {scope !== 'all' && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-muted py-1 pr-1 pl-3 text-sm">
                Vínculo: {scope === 'free' ? 'Livres' : 'Em clubes'}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Remover filtro de vínculo"
                  onClick={() => changeScope('all')}
                >
                  <X aria-hidden="true" />
                </Button>
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            className="ml-auto"
            onClick={clearFilters}
          >
            Limpar filtros
          </Button>
        </div>
      )}
      {isError ? (
        <ContentErrorState
          title="Não foi possível carregar os jogadores"
          error={error}
        />
      ) : (
        <Tabs
          value={scope}
          onValueChange={(value) => changeScope(value as PlayersScope)}
          className="gap-0 overflow-hidden rounded-xl border"
        >
          <div className="border-b p-4">
            <PlayersTableHeader sort={sort} onSortChange={changeSort} />
          </div>
          <TabsContent value={scope}>
            <DataTable
              contained
              className="rounded-none border-0"
              data={data?.data ?? []}
              columns={columns}
              getRowId={(player) => String(player.id)}
              isLoading={isPending}
              emptyContent={
                hasActiveFilters ? (
                  <ContentState
                    variant="not-found"
                    title="Nenhum jogador encontrado"
                    description="Ajuste a busca ou limpe os filtros para consultar os jogadores."
                    action={{ label: 'Limpar filtros', onClick: clearFilters }}
                  />
                ) : (data?.meta.total_items ?? 0) > 0 ? (
                  <ContentState
                    variant="not-found"
                    title="Nenhum jogador nesta página"
                    description="Volte à primeira página para consultar os jogadores cadastrados."
                    action={{
                      label: 'Ir para a primeira página',
                      onClick: () => setPage(1),
                    }}
                  />
                ) : (
                  <ContentState
                    variant="empty"
                    title="Nenhum jogador cadastrado"
                    description="Cadastre o primeiro jogador para começar a montar os elencos."
                    action={{
                      label: 'Cadastrar jogador',
                      onClick: onCreatePlayer,
                    }}
                  />
                )
              }
              caption={<span className="sr-only">Jogadores da liga</span>}
              footer={
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {data?.meta.total_items ?? 0} jogadores encontrados ·{' '}
                    {PAGE_SIZE} por página
                  </p>
                  <TablePagination
                    page={page}
                    pageCount={data?.meta.total_pages ?? 0}
                    onPageChange={setPage}
                    disabled={isPending}
                  />
                </div>
              }
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
