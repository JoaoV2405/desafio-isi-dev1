import type { PlayersScope, PlayersSort } from '../../types/players-query'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'

export function PlayersTableHeader({
  sort,
  onSortChange,
}: {
  sort: PlayersSort
  onSortChange: (sort: PlayersSort) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <TabsList variant="line" aria-label="Vínculo dos jogadores">
        {(
          [
            ['all', 'Todos'],
            ['free', 'Livres'],
            ['clubs', 'Em clubes'],
          ] satisfies [PlayersScope, string][]
        ).map(([value, label]) => (
          <TabsTrigger key={value} value={value}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      <label className="ml-auto flex items-center gap-2 text-sm">
        <span>Ordenar por</span>
        <NativeSelect
          value={sort}
          onChange={(event) => onSortChange(event.target.value as PlayersSort)}
        >
          <NativeSelectOption value="name">Nome</NativeSelectOption>
          <NativeSelectOption value="age_asc">Idade</NativeSelectOption>
          <NativeSelectOption value="value_desc">
            Valor de mercado
          </NativeSelectOption>
        </NativeSelect>
      </label>
    </div>
  )
}
