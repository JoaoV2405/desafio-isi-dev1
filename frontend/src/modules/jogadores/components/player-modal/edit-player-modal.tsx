import { useEffect, useId, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import type { PlayerFormValues } from '../../lib/player-form'
import {
  getEditPlayerFormRules,
  getEditPlayerFormValues,
} from '../../lib/edit-player-form'
import { PlayerGeneralFields } from '../player-general-fields'
import type { Player, PlayerCondition } from '@/shared/types/player'
import { Modal } from '@/components/modal/modal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { PlayerConditionBadge } from '@/shared/components/player-condition-badge'
import { PlayerIdentity } from '@/shared/components/player-identity'
import { PLAYER_CONDITIONS } from '@/shared/types/player'
import { getClubLineup } from '@/modules/clubes/services/clubs-api'
import { useClubs } from '@/modules/clubes/hooks/use-clubs'
import { Button } from '@/components/ui/button'
import type { EditPlayerInput } from '../../types/player-input'

interface EditPlayerModalProps {
  open: boolean
  player: Player
  onOpenChange: (open: boolean) => void
  onConfirm: (input: EditPlayerInput) => void
  isSubmitting?: boolean
  error?: string
}

export function EditPlayerModal({
  open,
  player,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  error,
}: EditPlayerModalProps) {
  const formId = useId()
  // Carrega os dados atuais sem incluir os indicadores exclusivos do cadastro.
  const form = useForm<PlayerFormValues>({
    defaultValues: getEditPlayerFormValues(player),
    mode: 'onTouched',
  })
  const { reset } = form

  // Reabre o formulário com os dados recebidos e descarta alterações e erros da abertura anterior.
  useEffect(() => {
    if (open) {
      reset(getEditPlayerFormValues(player))
    }
  }, [open, player, reset])
  // Mantém as restrições da edição antes de entregar os quatro campos ao PUT.
  const submitForm = form.handleSubmit((values) => {
    if (isSubmitting || !values.position) return
    onConfirm({ ...values, position: values.position })
  })

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar jogador"
      subtitle={`Atualize os dados de ${player.name}.`}
      className="max-w-2xl"
      primaryAction={{ label: 'Salvar alterações', formId }}
      // Usa o estado de envio do formulário para bloquear ações do modal durante o envio.
      isSubmitting={isSubmitting || form.formState.isSubmitting}
    >
      {/* Compartilha o formulário e aplica as restrições da edição aos quatro campos editáveis. */}
      <FormProvider {...form}>
        <form
          id={formId}
          noValidate
          onSubmit={submitForm}
          className="space-y-6"
        >
          <fieldset disabled={isSubmitting}>
            <PlayerGeneralFields
              rules={getEditPlayerFormRules(player)}
              minAge={player.age}
              lockedPosition={
                player.club_id !== null ? player.position : undefined
              }
            />
          </fieldset>
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="whitespace-pre-line">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </FormProvider>
    </Modal>
  )
}

const conditionOptions: { value: PlayerCondition; description: string }[] = [
  { value: 'APTO', description: 'Disponível para jogar.' },
  {
    value: 'MAL_CONDICIONADO',
    description: 'Pode jogar com desempenho reduzido.',
  },
  { value: 'DOENTE', description: 'Indisponível para jogar.' },
]

interface EditPlayerConditionModalProps extends Omit<
  EditPlayerModalProps,
  'onConfirm'
> {
  onConfirm: (player: Player, condition: PlayerCondition) => void
}

export function EditPlayerConditionModal({
  open,
  player,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  error,
}: EditPlayerConditionModalProps) {
  const groupId = useId()
  // Uma única escolha é suficiente; não há necessidade de um formulário para este fluxo.
  const [condition, setCondition] = useState<PlayerCondition>(player.condition)

  // Cada abertura ou troca de jogador começa com a condição atual recebida da listagem.
  useEffect(() => {
    if (open) setCondition(player.condition)
  }, [open, player.id, player.condition])

  // A restrição usa a condição persistida, mesmo após selecionar outra opção sem salvar.
  const isSick = player.condition === 'DOENTE'
  const isInvalidTransition = isSick && condition === 'APTO'
  const hasChanged = condition !== player.condition
  const shouldCheckLineup =
    open && condition === 'DOENTE' && hasChanged && player.club_id !== null
  const { data: clubs = [] } = useClubs()
  const lineup = useQuery({
    queryKey: ['clubs', 'lineup', player.club_id],
    queryFn: ({ signal }) => {
      if (player.club_id === null) throw new Error('Jogador sem clube.')
      return getClubLineup(player.club_id, signal)
    },
    enabled: shouldCheckLineup,
    // Confere a escalação atual antes de apresentar o aviso e habilitar a confirmação.
    staleTime: 0,
  })
  const isCheckingLineup =
    shouldCheckLineup && (lineup.isPending || lineup.isFetching)
  const hasLineupError = shouldCheckLineup && lineup.isError
  const isStarter =
    shouldCheckLineup &&
    lineup.data?.players.some((starter) => starter.id === player.id)
  const clubName =
    clubs.find((club) => club.id === player.club_id)?.name ??
    `Clube ${player.club_id}`

  function confirmCondition() {
    // Reforça o bloqueio na confirmação, além de desabilitar a opção na interface.
    if (
      isSubmitting ||
      !hasChanged ||
      isInvalidTransition ||
      isCheckingLineup ||
      hasLineupError
    )
      return
    onConfirm(player, condition)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Alterar condição física"
      subtitle="Escolha a nova condição física do jogador."
      primaryAction={{
        label: 'Salvar condição',
        pendingLabel: 'Salvando...',
        onClick: confirmCondition,
        disabled:
          !hasChanged ||
          isInvalidTransition ||
          isCheckingLineup ||
          hasLineupError,
      }}
      isSubmitting={isSubmitting}
    >
      {/* O badge representa a condição atual; a seleção abaixo representa a alteração proposta. */}
      <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
        <PlayerIdentity
          name={player.name}
          position={player.position}
          age={player.age}
          className="min-w-0 flex-1"
        />
        <PlayerConditionBadge condition={player.condition} />
      </div>

      <fieldset
        role="radiogroup"
        aria-labelledby={`${groupId}-title`}
        aria-describedby={`${groupId}-description`}
        disabled={isSubmitting}
        className="min-w-0 space-y-3"
      >
        <legend id={`${groupId}-title`} className="text-sm font-medium">
          Condição física
        </legend>
        <p
          id={`${groupId}-description`}
          className="text-sm text-muted-foreground"
        >
          {isSick
            ? 'Para voltar a Apto, o jogador deve passar primeiro por Mal condicionado.'
            : 'Selecione uma condição para atualizar o jogador.'}
        </p>
        {/* Opções em largura total, com gap-1 entre itens e entre o título e o subtítulo. */}
        <div className="grid gap-1">
          {conditionOptions.map(({ value, description }) => {
            const isBlocked = isSick && value === 'APTO'
            const isCurrent = value === player.condition

            return (
              <label
                key={value}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-md border border-input p-4 transition-colors hover:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-ring',
                  condition === value && 'border-primary bg-muted/50',
                  (isBlocked || isSubmitting) &&
                    'cursor-not-allowed opacity-50',
                )}
              >
                <input
                  type="radio"
                  name={groupId}
                  value={value}
                  checked={condition === value}
                  disabled={isBlocked || isSubmitting}
                  onChange={() => setCondition(value)}
                  aria-describedby={
                    isBlocked ? `${groupId}-description` : undefined
                  }
                  className="size-4 shrink-0 accent-primary"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-sm font-medium">
                    {PLAYER_CONDITIONS[value]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {description}
                  </span>
                </span>
                {isCurrent && <Badge variant="secondary">Atual</Badge>}
              </label>
            )
          })}
        </div>
      </fieldset>
      {isCheckingLineup && (
        <p role="status" className="text-sm text-muted-foreground">
          Verificando a escalação do clube...
        </p>
      )}
      {hasLineupError && (
        <Alert variant="destructive">
          <AlertDescription className="space-y-2">
            <p>{lineup.error.message}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void lineup.refetch()}
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {!isCheckingLineup && !hasLineupError && isStarter && (
        <Alert variant="warning" role="status">
          <AlertDescription>
            Ao confirmar, {player.name} será removido da escalação de {clubName}
            .
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="whitespace-pre-line">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </Modal>
  )
}
