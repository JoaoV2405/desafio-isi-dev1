import type { ClubsSort } from '../types/clubs-query'
import { Badge } from '@/components/ui/badge'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

export function ClubsHeader({
  total,
  sort,
  onSortChange,
}: {
  total: number | undefined
  sort: ClubsSort
  onSortChange: (sort: ClubsSort) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3" aria-live="polite">
        <p className="text-sm font-medium">
          {total === undefined ? 'Carregando clubes...' : `${total} clubes`}
        </p>
        {total !== undefined && (
          <Badge variant="secondary" className="rounded-md">
            {total} clubes de 20
          </Badge>
        )}
      </div>
      <label className="ml-auto flex items-center gap-2 text-sm">
        <span>Ordenar por</span>
        <NativeSelect
          value={sort}
          onChange={(event) => onSortChange(event.target.value as ClubsSort)}
        >
          <NativeSelectOption value="name">Nome</NativeSelectOption>
          <NativeSelectOption value="net_worth_desc">
            Patrimônio (maior para menor)
          </NativeSelectOption>
          <NativeSelectOption value="net_worth_asc">
            Patrimônio (menor para maior)
          </NativeSelectOption>
        </NativeSelect>
      </label>
    </div>
  )
}
