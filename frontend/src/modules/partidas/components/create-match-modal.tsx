import { useId, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Shield } from 'lucide-react'
import { matchDetailKey } from '../hooks/use-match'
import { createMatch } from '../services/matches-api'
import type { CreateMatchInput } from '../services/matches-api'
import { useClubs } from '@/modules/clubes/hooks/use-clubs'
import { Modal } from '@/components/modal/modal'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { ErrorAlert } from '@/components/ui/alert'
import { RoutePaths } from '@/router/route-paths'
import { dashboardQueryOptions } from '@/shared/hooks/use-dashboard'

export function CreateMatchModal({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void
}) {
  const formId = useId()
  const inFlight = useRef(false)
  const [homeId, setHomeId] = useState('')
  const [awayId, setAwayId] = useState('')
  const [validationError, setValidationError] = useState('')
  const clubs = useClubs()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const creation = useMutation({
    mutationFn: createMatch,
    retry: false,
    onSuccess: async (match) => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['classificacao'] }),
        queryClient.invalidateQueries({ queryKey: ['matches'] }),
        queryClient.invalidateQueries({
          queryKey: dashboardQueryOptions.queryKey,
        }),
      ])
      queryClient.setQueryData(matchDetailKey(String(match.id)), match)
      onOpenChange(false)
      await navigate({
        to: RoutePaths.match,
        params: { partidaId: String(match.id) },
        state: { createdMatchId: match.id },
      })
    },
    onSettled: () => {
      inFlight.current = false
    },
  })

  function submitMatch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    if (!homeId || !awayId || homeId === awayId) {
      setValidationError(
        'Selecione clubes diferentes para mandante e visitante.',
      )
      return
    }
    setValidationError('')
    inFlight.current = true
    const input: CreateMatchInput = {
      home_club_id: Number(homeId),
      away_club_id: Number(awayId),
    }
    creation.mutate(input)
  }

  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!inFlight.current) onOpenChange(open)
      }}
      title="Nova partida"
      subtitle="Escolha os clubes. O placar será determinado pelos duelos entre os titulares."
      primaryAction={{
        label: 'Jogar partida',
        pendingLabel: 'Jogando partida...',
        formId,
        disabled: clubs.isPending || clubs.isError || clubs.data.length < 2,
      }}
      isSubmitting={creation.isPending}
      feedback={
        <>
          {clubs.isError && (
            <ErrorAlert title="Não foi possível carregar os clubes">
              {clubs.error.message}
            </ErrorAlert>
          )}
          {(validationError || creation.error) && (
            <ErrorAlert
              title="Não foi possível jogar a partida"
              descriptionClassName="whitespace-pre-line"
            >
              {validationError || creation.error?.message}
            </ErrorAlert>
          )}
        </>
      }
    >
      <form id={formId} onSubmit={submitMatch} className="space-y-4">
        {clubs.isPending ? (
          <p role="status">Carregando clubes...</p>
        ) : clubs.isError ? null : clubs.data.length < 2 ? (
          <p role="status" className="text-sm text-muted-foreground">
            Cadastre pelo menos dois clubes para jogar uma partida.
          </p>
        ) : (
          <fieldset disabled={creation.isPending} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor={`${formId}-home`} className="text-sm font-medium">
                Mandante
              </label>
              <NativeSelect
                id={`${formId}-home`}
                icon={<Shield />}
                className="w-full"
                value={homeId}
                onChange={(event) => setHomeId(event.target.value)}
                required
              >
                <NativeSelectOption value="">
                  Selecione o mandante
                </NativeSelectOption>
                {clubs.data.map((club) => (
                  <NativeSelectOption
                    key={club.id}
                    value={club.id}
                    disabled={String(club.id) === awayId}
                  >
                    {club.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <label htmlFor={`${formId}-away`} className="text-sm font-medium">
                Visitante
              </label>
              <NativeSelect
                id={`${formId}-away`}
                icon={<Shield />}
                className="w-full"
                value={awayId}
                onChange={(event) => setAwayId(event.target.value)}
                required
              >
                <NativeSelectOption value="">
                  Selecione o visitante
                </NativeSelectOption>
                {clubs.data.map((club) => (
                  <NativeSelectOption
                    key={club.id}
                    value={club.id}
                    disabled={String(club.id) === homeId}
                  >
                    {club.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </fieldset>
        )}
      </form>
    </Modal>
  )
}
