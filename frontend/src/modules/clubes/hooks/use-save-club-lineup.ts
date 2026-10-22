import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveClubLineup } from '../services/clubs-api'
import type { ClubDetails } from '../types/club-details'
import type { ClubLineup, SaveClubLineupInput } from '../types/club-lineup'

export function useSaveClubLineup(
  clubId: number,
  onSuccess: (lineup: ClubLineup) => void,
) {
  const queryClient = useQueryClient()
  const inFlight = useRef(false)
  const mutation = useMutation({
    mutationFn: (input: SaveClubLineupInput) => saveClubLineup(clubId, input),
    retry: false,
    onSuccess: async (result) => {
      const queryKey = ['clubs', 'lineup', clubId]
      // Uma consulta iniciada antes do PUT não pode sobrescrever seu resultado.
      await Promise.all([
        queryClient.cancelQueries({ queryKey }),
        queryClient.cancelQueries({
          queryKey: ['clubs', 'detail', String(clubId)],
        }),
      ])
      queryClient.setQueryData(queryKey, result)
      queryClient.setQueryData<ClubDetails>(
        ['clubs', 'detail', String(clubId)],
        (club) => {
          if (!club?.players) return club
          return {
            ...club,
            players: club.players.map((player) => ({
              ...player,
              ...result.players.find(({ id }) => id === player.id),
            })),
          }
        },
      )
      onSuccess(result)
    },
  })

  async function submit(input: SaveClubLineupInput): Promise<boolean> {
    if (inFlight.current) return false
    inFlight.current = true
    try {
      await mutation.mutateAsync(input)
      return true
    } catch {
      // O erro da mutação permanece disponível para o formulário.
      return false
    } finally {
      inFlight.current = false
    }
  }

  return {
    submit,
    isPending: mutation.isPending,
    error: mutation.error?.message,
    reset: mutation.reset,
  }
}
