import type { PlayersScope, PlayersSort } from '../../types/players-query'
import { ArrowDownWideNarrow } from 'lucide-react'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox'

const sortOptions: { value: PlayersSort; label: string }[] = [
  { value: 'name', label: 'Nome' },
  { value: 'value_desc', label: 'Maior valor de mercado' },
  { value: 'value_asc', label: 'Menor valor de mercado' },
  { value: 'age_desc', label: 'Maior idade' },
  { value: 'age_asc', label: 'Menor idade' },
  { value: 'position', label: 'Posição (GOL a ATA)' },
]

export function PlayersTableHeader({
  sort,
  onSortChange,
  counts,
}: {
  sort: PlayersSort
  onSortChange: (sort: PlayersSort) => void
  counts: Record<PlayersScope, number | undefined>
}) {
  const selectedSort = sortOptions.find((option) => option.value === sort)!

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
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
            <Badge
              variant="secondary"
              className="h-5 min-w-5 rounded-full px-1.5 text-[11px] tabular-nums"
            >
              {counts[value] ?? '—'}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
      <Combobox
        items={sortOptions}
        filter={null}
        value={selectedSort}
        onValueChange={(option) => {
          if (option) onSortChange(option.value)
        }}
        itemToStringLabel={(option) => option.label}
        isItemEqualToValue={(option, value) => option.value === value.value}
      >
        <ComboboxTrigger
          render={<Button type="button" variant="outline" />}
          className="ml-auto"
          aria-label={`Ordenar: ${selectedSort.label}`}
        >
          <ArrowDownWideNarrow
            aria-hidden="true"
            className="text-muted-foreground"
          />
          Ordenar: {selectedSort.label}
        </ComboboxTrigger>
        <ComboboxContent align="end">
          <ComboboxList>
            {(option: (typeof sortOptions)[number]) => (
              <ComboboxItem key={option.value} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
