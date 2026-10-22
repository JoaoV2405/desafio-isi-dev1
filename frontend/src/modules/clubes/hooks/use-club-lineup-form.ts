import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { ClubPlayer } from '../types/club-details'
import type { SaveClubLineupInput } from '../types/club-lineup'
import type { LineupFormValues } from '../lib/lineup-form'
import { getLineupFormValues, lineupFormResolver } from '../lib/lineup-form'
import type { LineupSelection } from '../lib/lineup-selection'
import {
  getLineupPlayerOptions,
  reconcileLineupSelection,
} from '../lib/lineup-selection'
import { useClubLineup } from './use-club-lineup'
import { useSaveClubLineup } from './use-save-club-lineup'
import { toast } from '@/components/ui/toast'
import { FORMATION_LAYOUTS } from '@/shared/components/soccer-field/formations'
import type {
  FieldSlotId,
  SoccerFormation,
} from '@/shared/components/soccer-field/types'
import type { Player } from '@/shared/types/player'

function selectionsEqual(first: LineupSelection, second: LineupSelection) {
  return (
    Object.keys(first).length === Object.keys(second).length &&
    Object.entries(first).every(
      ([slotId, id]) => second[slotId as FieldSlotId] === id,
    )
  )
}

export function useClubLineupForm(clubId: number, players: ClubPlayer[]) {
  const lineup = useClubLineup(clubId)
  const form = useForm<LineupFormValues, Player[], SaveClubLineupInput>({
    defaultValues: getLineupFormValues(lineup.data, players),
    resolver: lineupFormResolver,
    context: players,
  })
  const { getValues, reset, setValue, trigger } = form
  const { isDirty, isSubmitted, isSubmitting } = form.formState
  const save = useSaveClubLineup(clubId, (result) => {
    reset(getLineupFormValues(result, players))
    toast.add({
      type: 'success',
      title: 'Escalação salva com sucesso.',
      timeout: 5000,
    })
  })
  const disabled =
    lineup.isPending || lineup.isError || save.isPending || isSubmitting

  useEffect(() => {
    const current = getValues()
    if (!isDirty) {
      const saved = getLineupFormValues(lineup.data, players)
      if (
        current.formation !== saved.formation ||
        !selectionsEqual(current.selection, saved.selection)
      ) {
        reset(saved)
      }
      return
    }
    if (!current.formation) return
    const selection = reconcileLineupSelection(
      current.formation,
      current.selection,
      players,
    )
    // Persiste remoções por venda ou doença, sem sobrescrever escolhas válidas.
    if (!selectionsEqual(current.selection, selection)) {
      setValue('selection', selection, {
        shouldDirty: true,
        shouldValidate: isSubmitted,
      })
    }
  }, [lineup.data, players, isDirty, isSubmitted, getValues, reset, setValue])

  function changeFormation(formation: SoccerFormation) {
    if (disabled) return
    save.reset()
    setValue('formation', formation, { shouldDirty: true })
    setValue(
      'selection',
      reconcileLineupSelection(formation, getValues('selection'), players),
      { shouldDirty: true },
    )
    if (isSubmitted) void trigger()
  }

  function changePlayer(slotId: FieldSlotId, playerId: number | null) {
    if (disabled) return
    const { formation, selection } = getValues()
    if (!formation) return
    const slot = FORMATION_LAYOUTS[formation].find(({ id }) => id === slotId)
    if (
      !slot ||
      (playerId !== null &&
        !getLineupPlayerOptions(slot, selection, players).some(
          ({ id }) => id === playerId,
        ))
    )
      return
    save.reset()
    setValue(
      'selection',
      { ...selection, [slotId]: playerId },
      {
        shouldDirty: true,
      },
    )
    if (isSubmitted) void trigger()
  }

  const submit = form.handleSubmit(async (input) => {
    if (lineup.isPending || lineup.isError) return
    await save.submit(input)
  })

  return { form, lineup, save, disabled, changeFormation, changePlayer, submit }
}
