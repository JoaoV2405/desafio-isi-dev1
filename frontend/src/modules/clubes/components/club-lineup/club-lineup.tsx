import { Controller, FormProvider, useWatch } from 'react-hook-form'
import { LoaderCircle, Save } from 'lucide-react'
import { useClubLineupForm } from '../../hooks/use-club-lineup-form'
import type { ClubPlayer } from '../../types/club-details'
import { hasPlayersForFormation } from '../../lib/lineup-selection'
import { validateLineup } from '../../lib/lineup-validation'
import { FormationSelector } from './formation-selector'
import { LineupStartersTable } from './lineup-starters-table'
import { LineupPreview } from './lineup-preview'
import { LineupSelectionCount } from './lineup-selection-count'
import { LineupReserves } from './lineup-reserves'
import { LineupConditionAlert } from './lineup-condition-alert'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  ErrorAlert,
} from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function ClubLineup({
  clubId,
  clubName,
  players,
}: {
  clubId: number
  clubName: string
  players: ClubPlayer[]
}) {
  const {
    form,
    lineup,
    save,
    disabled,
    changeFormation,
    changePlayer,
    submit,
  } = useClubLineupForm(clubId, players)
  const [formation, selection] = useWatch({
    control: form.control,
    name: ['formation', 'selection'],
  })
  const hasEnoughPlayers = hasPlayersForFormation(formation, players)
  const canSave = validateLineup(formation, selection, players).valid
  const selectedIds = new Set(Object.values(selection))
  const savedIds = new Set(lineup.data?.players.map(({ id }) => id))

  return (
    <FormProvider {...form}>
      <section
        aria-label="Escalação do clube"
        className="grid items-start gap-5 p-4 text-foreground lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]"
      >
        <form
          aria-label="Titulares"
          aria-busy={save.isPending}
          noValidate
          onSubmit={submit}
          className="min-w-0 overflow-hidden rounded-xl border bg-card"
        >
          <header className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Titulares</h2>
              <p className="text-sm text-muted-foreground">
                Escolha a formação e os jogadores que começam em campo.
              </p>
            </div>
            <div role="status" className="ml-auto">
              {lineup.data ? (
                <Badge variant={lineup.data.complete ? 'success' : 'warning'}>
                  {lineup.data.complete ? 'Completo' : 'Incompleto'}
                </Badge>
              ) : lineup.isPending ? (
                <span className="text-xs text-muted-foreground">
                  Carregando escalação...
                </span>
              ) : null}
            </div>
          </header>
          {lineup.isError && (
            <ErrorAlert
              className="rounded-none border-0 border-b"
              title="Não foi possível carregar a escalação"
              descriptionClassName="space-y-2"
            >
              <p className="whitespace-pre-line">{lineup.error.message}</p>
              <Button
                type="button"
                variant="outline"
                disabled={lineup.isFetching || save.isPending}
                onClick={() => void lineup.refetch()}
              >
                Tentar novamente
              </Button>
            </ErrorAlert>
          )}
          {lineup.data &&
            (!hasEnoughPlayers ||
              (lineup.data.formation && !lineup.data.complete)) &&
            !lineup.isError && (
              <div className="px-4 pt-4">
                <Alert variant="warning" role="status">
                  <AlertTitle>
                    Escalação incompleta: o {clubName} não pode jogar partidas
                  </AlertTitle>
                  <AlertDescription>
                    {hasEnoughPlayers ? (
                      'Preencha as vagas restantes e salve a escalação com os 5 titulares.'
                    ) : (
                      <>
                        O elenco tem {players.length}{' '}
                        {players.length === 1 ? 'jogador' : 'jogadores'}, e a
                        escalação precisa de 5: 1 goleiro e 4 jogadores de
                        linha.
                        {players.length >= 5 &&
                          ' Faltam jogadores disponíveis e compatíveis com as posições da formação.'}{' '}
                        Compre jogadores e salve a escalação com os 5 titulares.
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          <Controller
            control={form.control}
            name="formation"
            render={({ field, fieldState }) => (
              <FormationSelector
                value={field.value}
                onValueChange={changeFormation}
                disabled={disabled}
                error={fieldState.error?.message}
                inputRef={field.ref}
                onBlur={field.onBlur}
              />
            )}
          />
          <LineupStartersTable
            players={players}
            onPlayerChange={changePlayer}
            disabled={disabled}
            emptyMessage={
              lineup.isPending
                ? 'Carregando as vagas da escalação...'
                : lineup.isError
                  ? 'As vagas estarão disponíveis após carregar a escalação.'
                  : 'Escolha uma formação para organizar as cinco vagas dos titulares.'
            }
          />
          {save.error && (
            <ErrorAlert
              className="rounded-none border-0 border-t"
              title="Não foi possível salvar a escalação"
              descriptionClassName="whitespace-pre-line"
            >
              {save.error}
            </ErrorAlert>
          )}
          <footer className="space-y-4 border-t p-4">
            <LineupConditionAlert
              players={players.filter(({ id }) => selectedIds.has(id))}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <LineupSelectionCount players={players} />
              <Button type="submit" disabled={disabled || !canSave}>
                {save.isPending ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="animate-spin motion-reduce:animate-none"
                  />
                ) : (
                  <Save aria-hidden="true" />
                )}
                {save.isPending ? 'Salvando...' : 'Salvar escalação'}
              </Button>
            </div>
          </footer>
        </form>

        <div className="grid min-w-0 gap-5">
          <LineupPreview players={players} />

          <LineupReserves
            players={players.filter(({ id }) => !savedIds.has(id))}
            isLoading={lineup.isPending}
            hasError={lineup.isError}
          />
        </div>
      </section>
    </FormProvider>
  )
}
