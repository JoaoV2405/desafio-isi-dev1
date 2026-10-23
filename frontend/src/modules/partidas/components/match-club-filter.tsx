import { useClubs } from '@/modules/clubes/hooks/use-clubs'
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

interface ClubOption {
  id: number | null
  name: string
}

export function MatchClubFilter({
  clubId,
  onClubChange,
}: {
  clubId: number | null
  onClubChange: (clubId: number | null) => void
}) {
  const clubs = useClubs()
  const options: ClubOption[] = [
    { id: null, name: 'Todos os clubes' },
    ...(clubs.data ?? []),
  ]
  const selected = options.find((club) => club.id === clubId) ?? options[0]

  return (
    <div className="max-w-full space-y-2">
      <Combobox
        items={options}
        value={selected}
        onValueChange={(club) => onClubChange(club?.id ?? null)}
        itemToStringLabel={(club) => club.name}
        isItemEqualToValue={(club, value) => club.id === value.id}
        disabled={clubs.isPending || clubs.isError}
      >
        <ComboboxTrigger
          render={<Button type="button" variant="outline" />}
          className="w-full max-w-full justify-between sm:w-64"
          aria-label={`Filtrar por clube: ${selected.name}`}
        >
          <span className="truncate">
            {clubs.isPending
              ? 'Carregando clubes...'
              : `Clube: ${selected.name}`}
          </span>
        </ComboboxTrigger>
        <ComboboxContent className="min-w-64">
          <ComboboxInput
            aria-label="Buscar clube no filtro"
            placeholder="Buscar clube..."
            showTrigger={false}
          />
          <ComboboxEmpty>Nenhum clube encontrado.</ComboboxEmpty>
          <ComboboxList>
            {(club: ClubOption) => (
              <ComboboxItem key={club.id ?? 'all'} value={club}>
                {club.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {clubs.isError && (
        <p role="alert" className="text-sm text-destructive">
          {clubs.error.message}
        </p>
      )}
    </div>
  )
}
