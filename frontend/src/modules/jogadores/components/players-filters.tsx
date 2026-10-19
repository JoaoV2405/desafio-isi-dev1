import type { PlayersFilterValues, PlayersScope } from '../types/players-query'
import type { ClubSummary } from '@/shared/types/club'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { PLAYER_CONDITIONS, PLAYER_POSITIONS } from '@/shared/types/player'

interface PlayersFiltersProps {
  value: PlayersFilterValues
  onChange: (value: PlayersFilterValues) => void
  scope: PlayersScope
  clubs: ClubSummary[]
}

export function PlayersFilters({
  value,
  onChange,
  scope,
  clubs,
}: PlayersFiltersProps) {
  function updateFilter<TKey extends keyof PlayersFilterValues>(
    key: TKey,
    nextValue: PlayersFilterValues[TKey],
  ) {
    onChange({ ...value, [key]: nextValue })
  }

  return (
    <div
      aria-label="Filtros de jogadores"
      className="grid grid-cols-6 items-end gap-1"
    >
      <label className="col-span-2 space-y-1 text-sm">
        <span>Buscar jogador</span>
        <Input
          placeholder="Buscar por nome (mínimo 2 letras)"
          value={value.search}
          maxLength={100}
          onChange={(event) => updateFilter('search', event.target.value)}
        />
      </label>
      <label className="space-y-1 text-sm">
        <span>Posição</span>
        <NativeSelect
          className="w-full"
          value={value.position}
          onChange={(event) =>
            updateFilter(
              'position',
              event.target.value as PlayersFilterValues['position'],
            )
          }
        >
          <NativeSelectOption value="">Todas as posições</NativeSelectOption>
          {Object.entries(PLAYER_POSITIONS).map(([position, label]) => (
            <NativeSelectOption key={position} value={position}>
              {label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>
      <label className="space-y-1 text-sm">
        <span>Condição</span>
        <NativeSelect
          className="w-full"
          value={value.condition}
          onChange={(event) =>
            updateFilter(
              'condition',
              event.target.value as PlayersFilterValues['condition'],
            )
          }
        >
          <NativeSelectOption value="">Todas as condições</NativeSelectOption>
          {Object.entries(PLAYER_CONDITIONS).map(([condition, label]) => (
            <NativeSelectOption key={condition} value={condition}>
              {label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>
      <label className="space-y-1 text-sm">
        <span>Clube</span>
        <NativeSelect
          className="w-full"
          value={value.clubId}
          disabled={scope === 'free'}
          onChange={(event) => updateFilter('clubId', event.target.value)}
        >
          <NativeSelectOption value="">Todos os clubes</NativeSelectOption>
          {clubs.map((club) => (
            <NativeSelectOption key={club.id} value={club.id}>
              {club.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>
      {/* <fieldset className="min-w-0 space-y-1">
        <legend className="text-sm">Idade</legend>
        <div className="flex gap-2">
          <Input
            aria-label="Idade mínima"
            type="number"
            min={16}
            max={45}
            placeholder="Mínima"
            value={value.minAge}
            onChange={(event) => updateFilter('minAge', event.target.value)}
          />
          <Input
            aria-label="Idade máxima"
            type="number"
            min={16}
            max={45}
            placeholder="Máxima"
            value={value.maxAge}
            onChange={(event) => updateFilter('maxAge', event.target.value)}
          />
        </div>
      </fieldset> */}
      <fieldset className="min-w-0 space-y-1">
        {/*
        um fieldset só
        */}
        <legend className="text-sm">Valor de mercado (moedas)</legend>
        <div className="flex gap-2">
          <Input
            aria-label="Valor de mercado mínimo"
            type="number"
            min={0}
            max={550}
            step="0.01"
            placeholder="Mínimo"
            value={value.minValue}
            onChange={(event) => updateFilter('minValue', event.target.value)}
          />
          <Input
            aria-label="Valor de mercado máximo"
            type="number"
            min={0}
            max={550}
            step="0.01"
            placeholder="Máximo"
            value={value.maxValue}
            onChange={(event) => updateFilter('maxValue', event.target.value)}
          />
        </div>
      </fieldset>
    </div>
  )
}
