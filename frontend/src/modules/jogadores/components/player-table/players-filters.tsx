import type { UseFormRegister } from 'react-hook-form'
import type {
  PlayersFilterValues,
  PlayersScope,
} from '../../types/players-query'
import type { ClubSummary } from '@/shared/types/club'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { PLAYER_CONDITIONS, PLAYER_POSITIONS } from '@/shared/types/player'

interface PlayersFiltersProps {
  register: UseFormRegister<PlayersFilterValues>
  onFilterChange: () => void
  scope: PlayersScope
  clubs: ClubSummary[]
  clubsLoading?: boolean
  clubsUnavailable?: boolean
}

export function PlayersFilters({
  register,
  onFilterChange,
  scope,
  clubs,
  clubsLoading = false,
  clubsUnavailable = false,
}: PlayersFiltersProps) {
  // Cada campo passa seu valor ao React Hook Form e reinicia a paginação ao mudar.
  const registerFilter = (name: keyof PlayersFilterValues) =>
    register(name, { onChange: onFilterChange })

  return (
    <div
      aria-label="Filtros de jogadores"
      className="grid grid-cols-6 items-end gap-1"
    >
      <label className="col-span-2 space-y-1 text-sm">
        <span>Buscar jogador</span>
        <Input
          {...registerFilter('search')}
          placeholder="Buscar por nome (mínimo 2 letras)"
          maxLength={100}
        />
      </label>
      <label className="space-y-1 text-sm">
        <span>Posição</span>
        <NativeSelect {...registerFilter('position')} className="w-full">
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
        <NativeSelect {...registerFilter('condition')} className="w-full">
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
          {...registerFilter('clubId')}
          className="w-full"
          // Evita oferecer opções vazias enquanto a consulta não terminou ou falhou.
          disabled={scope === 'free' || clubsLoading || clubsUnavailable}
        >
          <NativeSelectOption value="">
            {clubsLoading
              ? 'Carregando clubes...'
              : clubsUnavailable
                ? 'Clubes indisponíveis'
                : 'Todos os clubes'}
          </NativeSelectOption>
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
            {...registerFilter('minAge')}
          />
          <Input
            aria-label="Idade máxima"
            type="number"
            min={16}
            max={45}
            placeholder="Máxima"
            {...registerFilter('maxAge')}
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
            {...registerFilter('minValue')}
            aria-label="Valor de mercado mínimo"
            type="number"
            min={0}
            max={550}
            step="0.01"
            placeholder="Mínimo"
          />
          <Input
            {...registerFilter('maxValue')}
            aria-label="Valor de mercado máximo"
            type="number"
            min={0}
            max={550}
            step="0.01"
            placeholder="Máximo"
          />
        </div>
      </fieldset>
    </div>
  )
}
