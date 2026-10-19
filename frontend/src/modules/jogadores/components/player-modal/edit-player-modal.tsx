import { useEffect, useId, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { PlayerFormValues } from '../../lib/player-form'
import {
  getEditPlayerFormRules,
  getEditPlayerFormValues,
} from '../../lib/edit-player-form'
import { PlayerGeneralFields } from '../player-general-fields'
import type { Player, PlayerCondition } from '@/shared/types/player'
import { Modal } from '@/components/modal/modal'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { PlayerConditionBadge } from '@/shared/components/player-condition-badge'
import { PlayerIdentity } from '@/shared/components/player-identity'
import { PLAYER_CONDITIONS } from '@/shared/types/player'

interface EditPlayerModalProps {
  open: boolean
  player: Player
  onOpenChange: (open: boolean) => void
}

export function EditPlayerModal({
  open,
  player,
  onOpenChange,
}: EditPlayerModalProps) {
  const formId = useId()
  // Carrega os dados atuais sem incluir os indicadores exclusivos do cadastro.
  const form = useForm<PlayerFormValues>({
    defaultValues: getEditPlayerFormValues(player),
    mode: 'onTouched',
  })
  // Este estado controla somente o aviso visual; os dados ficam no React Hook Form.
  const [isValidated, setIsValidated] = useState(false)
  const { reset } = form

  // Reabre o formulário com os dados recebidos e descarta alterações e erros da abertura anterior.
  useEffect(() => {
    if (open) {
      reset(getEditPlayerFormValues(player))
      setIsValidated(false)
    }
  }, [open, player, reset])
  // handleSubmit bloqueia dados inválidos e foca o primeiro erro antes de executar a ação.
  const submitForm = form.handleSubmit(
    () => {
      // Integração da edição será adicionada em uma próxima etapa.
      setIsValidated(true)
    },
    () => setIsValidated(false),
  )

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar jogador"
      subtitle={`Atualize os dados de ${player.name}.`}
      className="max-w-2xl"
      primaryAction={{ label: 'Salvar alterações', formId }}
      // Usa o estado de envio do formulário para bloquear ações do modal durante o envio.
      isSubmitting={form.formState.isSubmitting}
    >
      {/* Compartilha o formulário e aplica as restrições da edição aos quatro campos editáveis. */}
      <FormProvider {...form}>
        <form
          id={formId}
          noValidate
          onSubmit={submitForm}
          // Invalida o aviso anterior quando qualquer dado é alterado.
          onChange={() => setIsValidated(false)}
          className="space-y-6"
        >
          <PlayerGeneralFields
            rules={getEditPlayerFormRules(player)}
            minAge={player.age}
            lockedPosition={
              player.club_id !== null ? player.position : undefined
            }
          />
          {isValidated && (
            <p
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
            >
              Dados preenchidos corretamente.
            </p>
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

interface EditPlayerConditionModalProps extends EditPlayerModalProps {
  onConfirm?: (player: Player, condition: PlayerCondition) => void
  isSubmitting?: boolean
}

export function EditPlayerConditionModal({
  open,
  player,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
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

  function confirmCondition() {
    // Reforça o bloqueio na confirmação, além de desabilitar a opção na interface.
    if (isSubmitting || !hasChanged || isInvalidTransition) return
    onConfirm?.(player, condition)
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
        // A operação será habilitada quando o callback de integração estiver disponível.
        disabled: !onConfirm || !hasChanged || isInvalidTransition,
      }}
      isSubmitting={isSubmitting}
    >
      {/* O badge representa a condição atual; a seleção abaixo representa a alteração proposta. */}
      <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
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
                  'flex w-full cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
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
    </Modal>
  )
}
