import { HandCoins, ShoppingCart, UserRound } from 'lucide-react'
import type {
  TransactionPlayerOption,
  TransactionType,
} from '../../types/club-transactions'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox'

interface TransactionFiltersProps {
  types: TransactionType[]
  onTypesChange: (types: TransactionType[]) => void
  players: TransactionPlayerOption[]
  playerId: number | null
  onPlayerChange: (playerId: number | null) => void
  disabled: boolean
}

const transactionTypes = [
  { value: 'COMPRA', label: 'Compra', icon: ShoppingCart },
  { value: 'VENDA', label: 'Venda', icon: HandCoins },
] as const

export function TransactionFilters({
  types,
  onTypesChange,
  players,
  playerId,
  onPlayerChange,
  disabled,
}: TransactionFiltersProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-4"
      aria-label="Filtros do histórico"
    >
      <fieldset className="flex items-center gap-2" disabled={disabled}>
        <legend className="sr-only">Tipo de transação</legend>
        <span className="mr-1 text-sm font-medium">Tipo</span>
        {transactionTypes.map(({ value, label, icon: Icon }) => {
          const selected = types.includes(value)
          return (
            <Button
              key={value}
              type="button"
              variant="outline"
              aria-pressed={selected}
              className={selected ? 'border-foreground/30 bg-muted' : ''}
              disabled={disabled || (selected && types.length === 1)}
              title={
                selected && types.length === 1
                  ? 'Selecione pelo menos um tipo'
                  : undefined
              }
              onClick={() =>
                onTypesChange(
                  selected
                    ? types.filter((type) => type !== value)
                    : [...types, value],
                )
              }
            >
              <Icon aria-hidden="true" />
              {label}
            </Button>
          )
        })}
      </fieldset>
      <Combobox
        items={players}
        value={players.find((player) => player.id === playerId) ?? players[0]}
        onValueChange={(player) => onPlayerChange(player?.id ?? null)}
        itemToStringLabel={(player) => player.name}
        isItemEqualToValue={(player, value) => player.id === value.id}
        disabled={disabled}
      >
        <ComboboxTrigger
          render={<Button type="button" variant="outline" />}
          className="max-w-full justify-between"
          aria-label={`Jogador: ${players.find((player) => player.id === playerId)?.name ?? 'Todos'}`}
        >
          <UserRound aria-hidden="true" />
          <span className="truncate">
            Jogador:{' '}
            {players.find((player) => player.id === playerId)?.name ?? 'Todos'}
          </span>
        </ComboboxTrigger>
        <ComboboxContent className="min-w-64">
          <ComboboxInput
            aria-label="Buscar jogador no filtro"
            placeholder="Buscar jogador..."
            showTrigger={false}
            className="w-auto"
          />
          <ComboboxEmpty>Nenhum jogador encontrado.</ComboboxEmpty>
          <ComboboxList>
            {(player: TransactionPlayerOption) => (
              <ComboboxItem key={player.id ?? 'all'} value={player}>
                {player.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
