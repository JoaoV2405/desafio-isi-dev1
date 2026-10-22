import { Controller, FormProvider } from 'react-hook-form'
import { LoaderCircle, Save } from 'lucide-react'
import { useClubLineupForm } from '../../hooks/use-club-lineup-form'
import type { ClubPlayer } from '../../types/club-details'
import { FormationSelector } from './formation-selector'
import { LineupStartersTable } from './lineup-starters-table'
import { LineupPreview } from './lineup-preview'
import { LineupSelectionCount } from './lineup-selection-count'
import { LineupReserves } from './lineup-reserves'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function ClubLineup({
  clubId,
  players,
}: {
  clubId: number
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
            <Alert
              variant="destructive"
              className="rounded-none border-0 border-b"
            >
              <AlertTitle>Não foi possível carregar a escalação</AlertTitle>
              <AlertDescription className="space-y-2">
                <p className="whitespace-pre-line">{lineup.error.message}</p>
                <Button
                  type="button"
                  variant="outline"
                  disabled={lineup.isFetching || save.isPending}
                  onClick={() => void lineup.refetch()}
                >
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {lineup.data && !lineup.data.complete && !lineup.isError && (
            <Alert
              variant={lineup.data.formation ? 'warning' : 'default'}
              role="status"
              className="rounded-none border-0 border-b"
            >
              <AlertTitle>
                {lineup.data.formation
                  ? 'Escalação incompleta'
                  : 'Nenhuma escalação salva'}
              </AlertTitle>
              <AlertDescription>
                O clube não pode jogar. Escolha uma formação e salve cinco
                titulares válidos.
              </AlertDescription>
            </Alert>
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
          {players.length === 0 && !disabled && (
            <p className="border-b p-4 text-sm text-muted-foreground">
              O elenco está vazio. Contrate jogadores para montar a escalação.
            </p>
          )}
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
            <Alert
              variant="destructive"
              className="rounded-none border-0 border-t"
            >
              <AlertTitle>Não foi possível salvar a escalação</AlertTitle>
              <AlertDescription className="whitespace-pre-line">
                {save.error}
              </AlertDescription>
            </Alert>
          )}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
            <LineupSelectionCount players={players} />
            <Button type="submit" disabled={disabled}>
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
