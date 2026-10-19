import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { X } from 'lucide-react'
import type {
  PlayersFilterValues,
  PlayersScope,
  PlayersSort,
} from '../../types/players-query'
import { DEFAULT_PLAYER_FILTERS } from '../../types/players-query'
import { mockClubs } from '../../data/mock-players'
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

const PAGE_SIZE = 10

interface PlayersTableProps {
  onPlayerAction?: PlayerActionsMenuProps['onAction']
}

export function PlayersTable({ onPlayerAction }: PlayersTableProps) {
  // Centraliza os filtros e observa alterações para manter consulta e indicadores sincronizados.
  const { register, control, setValue, reset } = useForm<PlayersFilterValues>({
    defaultValues: DEFAULT_PLAYER_FILTERS,
  })
  const filters = { ...DEFAULT_PLAYER_FILTERS, ...useWatch({ control }) }
  const [scope, setScope] = useState<PlayersScope>('all')
  const [sort, setSort] = useState<PlayersSort>('name')
  const [page, setPage] = useState(1)
  // TODO: substituir mockClubs pela consulta GET /clubs ao ativar a integração.
  const columns = useMemo(
    () => createPlayerColumns({ clubs: mockClubs, onPlayerAction }),
    [onPlayerAction],
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
      ? `Clube: ${mockClubs.find((club) => String(club.id) === filters.clubId)?.name ?? filters.clubId}`
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
        clubs={mockClubs}
      />
      {hasActiveFilters && (
        <div
          aria-label="Filtros ativos"
          className="flex items-center gap-4 border-b pb-4"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
            {activeFilters.map(([key, label]) => (
              <span
                key={key}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-muted py-1 pr-1 pl-3 text-sm"
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
              <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-muted py-1 pr-1 pl-3 text-sm">
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
        <Alert variant="destructive">
          <AlertTitle>Não foi possível carregar os jogadores</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : (
        <Tabs
          value={scope}
          onValueChange={(value) => changeScope(value as PlayersScope)}
          className="gap-0 overflow-hidden rounded-lg border"
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
              emptyMessage="Nenhum jogador encontrado."
              caption={<span className="sr-only">Jogadores da liga</span>}
              footer={
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
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
