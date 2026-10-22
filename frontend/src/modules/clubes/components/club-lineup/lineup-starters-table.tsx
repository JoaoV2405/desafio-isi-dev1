import type { ClubPlayer } from '../../types/club-details'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import type { LineupFormValues } from '../../lib/lineup-form'
import {
  getLineupAttributes,
  getLineupPlayerOptions,
} from '../../lib/lineup-selection'
import { LineupPlayerSelect } from './lineup-player-select'
import type { FieldSlotId } from '@/shared/components/soccer-field/types'
import { FORMATION_LAYOUTS } from '@/shared/components/soccer-field/formations'
import { getFieldSlotLabel } from '@/shared/components/soccer-field/lineup-occupants'
import { PlayerConditionBadge } from '@/shared/components/player-condition-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const sectorAbbreviations = {
  goalkeeper: 'GOL',
  defense: 'ZAG / LAT',
  midfield: 'MEI',
  attack: 'ATA',
} as const

const attributeLabels = {
  defending: 'Defesa',
  shooting: 'Finalização',
  passing: 'Passe',
  dribbling: 'Drible',
} as const

interface LineupStartersTableProps {
  players: ClubPlayer[]
  onPlayerChange: (slotId: FieldSlotId, playerId: number | null) => void
  disabled: boolean
  emptyMessage: string
}

export function LineupStartersTable({
  players,
  onPlayerChange,
  disabled,
  emptyMessage,
}: LineupStartersTableProps) {
  const { control } = useFormContext<LineupFormValues>()
  const [formation, selection] = useWatch({
    control,
    name: ['formation', 'selection'],
  })
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">Vaga</TableHead>
          <TableHead>Titular</TableHead>
          <TableHead>Condição</TableHead>
          <TableHead>Overall</TableHead>
          <TableHead className="pr-4">Atributos usados</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {formation ? (
          FORMATION_LAYOUTS[formation].map((slot) => {
            const player =
              players.find(({ id }) => id === selection[slot.id]) ?? null
            const slotLabel = getFieldSlotLabel(slot)
            return (
              <TableRow key={slot.id}>
                <TableCell className="pl-4">
                  <span className="block font-semibold">
                    {sectorAbbreviations[slot.sector]}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {slotLabel}
                  </span>
                </TableCell>
                <TableCell>
                  <Controller
                    control={control}
                    name={`selection.${slot.id}`}
                    render={({ field, fieldState }) => (
                      <LineupPlayerSelect
                        slotLabel={slotLabel}
                        players={getLineupPlayerOptions(
                          slot,
                          selection,
                          players,
                        )}
                        value={player}
                        onValueChange={(playerId) =>
                          onPlayerChange(slot.id, playerId)
                        }
                        disabled={disabled}
                        error={fieldState.error?.message}
                        inputRef={field.ref}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  {player ? (
                    <PlayerConditionBadge condition={player.condition} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="font-medium tabular-nums">
                  {player?.overall ?? (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="pr-4">
                  {player ? (
                    <span className="inline-flex items-center gap-3 whitespace-nowrap">
                      {getLineupAttributes(
                        formation,
                        selection,
                        players,
                        player,
                      ).map((attribute) => (
                        <span key={attribute} className="text-muted-foreground">
                          {attributeLabels[attribute]}{' '}
                          <span className="font-medium text-foreground tabular-nums">
                            {player[attribute] ?? '—'}
                          </span>
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })
        ) : (
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={5}
              className="h-64 px-4 text-center whitespace-normal text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
