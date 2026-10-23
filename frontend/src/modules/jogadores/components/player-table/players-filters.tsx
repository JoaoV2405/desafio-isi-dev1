import { useId } from 'react'
import {
  ChevronDown,
  Coins,
  HeartPulse,
  Search,
  Shield,
  Shirt,
} from 'lucide-react'
import type { UseFormRegister } from 'react-hook-form'
import type {
  PlayersFilterValues,
  PlayersScope,
} from '../../types/players-query'
import type { ClubSummary } from '@/shared/types/club'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { PLAYER_CONDITIONS, PLAYER_POSITIONS } from '@/shared/types/player'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatMoney } from '@/shared/lib/format-money'

interface PlayersFiltersProps {
  register: UseFormRegister<PlayersFilterValues>
  onFilterChange: () => void
  scope: PlayersScope
  clubs: ClubSummary[]
  clubsLoading?: boolean
  clubsUnavailable?: boolean
  minValue: string
  maxValue: string
}

export function PlayersFilters({
  register,
  onFilterChange,
  scope,
  clubs,
  clubsLoading = false,
  clubsUnavailable = false,
  minValue,
  maxValue,
}: PlayersFiltersProps) {
  const searchDescriptionId = useId()
  const valueLabel =
    minValue && maxValue
      ? `${formatMoney(Number(minValue))} – ${formatMoney(Number(maxValue))}`
      : minValue
        ? `A partir de ${formatMoney(Number(minValue))}`
        : maxValue
          ? `Até ${formatMoney(Number(maxValue))}`
          : 'Todos os valores'
  // Cada campo passa seu valor ao React Hook Form e reinicia a paginação ao mudar.
  const registerFilter = (name: keyof PlayersFilterValues) =>
    register(name, { onChange: onFilterChange })

  return (
    <div
      aria-label="Filtros de jogadores"
      className="grid grid-cols-1 items-end gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <label className="space-y-1 text-sm font-medium sm:col-span-2">
        <span>Buscar jogador</span>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            {...registerFilter('search')}
            placeholder="Ex.: Carlos Silva"
            aria-describedby={searchDescriptionId}
            maxLength={100}
            className="pl-9"
          />
        </div>
      </label>
      <label className="space-y-1 text-sm font-medium">
        <span>Posição</span>
        <NativeSelect
          {...registerFilter('position')}
          className="w-full"
          icon={<Shirt />}
        >
          <NativeSelectOption value="">Todas as posições</NativeSelectOption>
          {Object.entries(PLAYER_POSITIONS).map(([position, label]) => (
            <NativeSelectOption key={position} value={position}>
              {label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>
      <label className="space-y-1 text-sm font-medium">
        <span>Condição</span>
        <NativeSelect
          {...registerFilter('condition')}
          className="w-full"
          icon={<HeartPulse />}
        >
          <NativeSelectOption value="">Todas as condições</NativeSelectOption>
          {Object.entries(PLAYER_CONDITIONS).map(([condition, label]) => (
            <NativeSelectOption key={condition} value={condition}>
              {label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>
      <label className="space-y-1 text-sm font-medium">
        <span>Clube</span>
        <NativeSelect
          {...registerFilter('clubId')}
          className="w-full"
          icon={<Shield />}
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
      <div className="min-w-0 space-y-1">
        <span className="text-sm font-medium">Valor de mercado</span>
        <Popover>
          <PopoverTrigger
            render={<Button type="button" variant="outline" />}
            className="w-full justify-between font-normal"
            aria-label={`Valor de mercado: ${valueLabel}`}
          >
            <Coins aria-hidden="true" className="text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-left">
              {valueLabel}
            </span>
            <ChevronDown aria-hidden="true" className="text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent align="end">
            <PopoverTitle>Valor de mercado (moedas)</PopoverTitle>
            <div className="flex gap-3">
              <label className="min-w-0 flex-1 space-y-1 text-sm font-medium">
                <span>Mínimo</span>
                <Input
                  {...registerFilter('minValue')}
                  type="number"
                  min={0}
                  max={550}
                  step="0.01"
                  placeholder="0,00"
                />
              </label>
              <label className="min-w-0 flex-1 space-y-1 text-sm font-medium">
                <span>Máximo</span>
                <Input
                  {...registerFilter('maxValue')}
                  type="number"
                  min={0}
                  max={550}
                  step="0.01"
                  placeholder="550,00"
                />
              </label>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <p
        id={searchDescriptionId}
        className="col-span-full text-xs text-muted-foreground"
      >
        Para buscar por nome, digite pelo menos 2 caracteres.
      </p>
    </div>
  )
}
