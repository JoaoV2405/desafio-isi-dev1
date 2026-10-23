import { useEffect, useId } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { PlayerFormValues } from '../../lib/player-form'
import {
  getEditPlayerFormRules,
  getEditPlayerFormValues,
} from '../../lib/edit-player-form'
import { PlayerGeneralFields } from '../player-general-fields'
import type { Player } from '@/shared/types/player'
import { Modal } from '@/components/modal/modal'
import { ErrorAlert } from '@/components/ui/alert'
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
      feedback={
        <>
          {error && (
            <ErrorAlert
              title="Não foi possível salvar as alterações"
              descriptionClassName="whitespace-pre-line"
            >
              {error}
            </ErrorAlert>
          )}
        </>
      }
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
        </form>
      </FormProvider>
    </Modal>
  )
}
