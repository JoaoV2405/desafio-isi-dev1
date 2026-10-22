import { useId } from 'react'
import type { Ref } from 'react'
import { X } from 'lucide-react'
import type { ClubPlayer } from '../../types/club-details'
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
import { PLAYER_POSITIONS } from '@/shared/types/player'

interface LineupPlayerSelectProps {
  slotLabel: string
  players: ClubPlayer[]
  value: ClubPlayer | null
  onValueChange: (playerId: number | null) => void
  disabled: boolean
  error?: string
  inputRef?: Ref<HTMLButtonElement>
  onBlur?: () => void
}

export function LineupPlayerSelect({
  slotLabel,
  players,
  value,
  onValueChange,
  disabled,
  error,
  inputRef,
  onBlur,
}: LineupPlayerSelectProps) {
  const errorId = useId()
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <Combobox
          items={players}
          value={value}
          onValueChange={(player) => onValueChange(player?.id ?? null)}
          itemToStringLabel={(player) => player.name}
          isItemEqualToValue={(player, selected) => player.id === selected.id}
          disabled={disabled}
        >
          <ComboboxTrigger
            ref={inputRef}
            onBlur={onBlur}
            render={<Button type="button" variant="outline" />}
            className="w-44 justify-between"
            aria-label={`${slotLabel}: ${value?.name ?? 'Selecionar jogador'}`}
            title={value?.name}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
          >
            <span className="truncate">
              {value?.name ?? 'Selecionar jogador'}
            </span>
          </ComboboxTrigger>
          <ComboboxContent className="min-w-64">
            <ComboboxInput
              aria-label={`Buscar jogador para ${slotLabel}`}
              placeholder="Buscar jogador..."
              showTrigger={false}
            />
            <ComboboxEmpty className="px-3">
              {players.length === 0
                ? 'Nenhum jogador disponível para esta vaga.'
                : 'Nenhum jogador encontrado.'}
            </ComboboxEmpty>
            <ComboboxList>
              {(player: ClubPlayer) => (
                <ComboboxItem key={player.id} value={player}>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{player.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {PLAYER_POSITIONS[player.position]}
                    </span>
                  </span>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Remover ${value.name} de ${slotLabel}`}
            disabled={disabled}
            onClick={() => onValueChange(null)}
          >
            <X aria-hidden="true" />
          </Button>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="max-w-52 text-xs whitespace-normal text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  )
}
