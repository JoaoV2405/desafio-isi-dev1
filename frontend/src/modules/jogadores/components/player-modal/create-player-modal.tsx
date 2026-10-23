import { useId } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { CreatePlayerFormValues } from '../../lib/create-player-form'
import { getDefaultCreatePlayerFormValues } from '../../lib/create-player-form'
import { PlayerAttributesPreview } from '../player-attributes-preview'
import { PlayerGeneralFields } from '../player-general-fields'
import { PlayerFormField } from '../player-form-field'
import { PlayerTechnicalFields } from '../player-technical-fields'
import { Modal } from '@/components/modal/modal'
import { ErrorAlert } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import type { CreatePlayerInput } from '../../types/player-input'

interface CreatePlayerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (input: CreatePlayerInput) => void
  isSubmitting?: boolean
  error?: string
}

export function CreatePlayerModal({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  error,
}: CreatePlayerModalProps) {
  const formId = useId()
  // Centraliza valores, erros e foco; valida ao sair do campo e ao corrigir campos já tocados.
  const form = useForm<CreatePlayerFormValues>({
    defaultValues: getDefaultCreatePlayerFormValues(),
    mode: 'onTouched',
  })
  // Entrega somente dados válidos à operação HTTP; a posição vazia nunca é enviada.
  const submitForm = form.handleSubmit((values) => {
    if (isSubmitting || !values.position) return
    onConfirm({ ...values, position: values.position })
  })

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Cadastrar jogador"
      subtitle="Informe os dados pessoais e os indicadores técnicos do jogador."
      className="max-w-5xl"
      primaryAction={{ label: 'Cadastrar jogador', formId }}
      // Usa o estado de envio do formulário para bloquear ações do modal durante o envio.
      isSubmitting={isSubmitting || form.formState.isSubmitting}
      feedback={
        <>
          {error && (
            <ErrorAlert
              title="Não foi possível cadastrar o jogador"
              descriptionClassName="whitespace-pre-line"
            >
              {error}
            </ErrorAlert>
          )}
        </>
      }
    >
      {/* Distribui os métodos aos campos e à prévia sem repassar valores e eventos por props. */}
      <FormProvider {...form}>
        <form
          id={formId}
          noValidate
          onSubmit={submitForm}
          className="space-y-6"
        >
          {/* Mantém os dados enviados estáveis enquanto a operação está pendente. */}
          <fieldset disabled={isSubmitting} className="space-y-6">
            <PlayerGeneralFields>
              {/* A indicação de valor base pertence ao cadastro e é composta junto dos campos comuns. */}
              <PlayerFormField
                label="Valor base"
                value="Após salvar"
                disabled
                description="Calculado ao cadastrar o jogador."
              />
            </PlayerGeneralFields>
            <Separator />
            <section
              aria-labelledby={`${formId}-technical-title`}
              className="space-y-5"
            >
              <div className="space-y-1">
                <h2
                  id={`${formId}-technical-title`}
                  className="text-base font-semibold"
                >
                  Indicadores técnicos
                </h2>
                <p className="text-sm text-muted-foreground">
                  Defina os atributos e o potencial do jogador, de 1 a 99.
                </p>
              </div>
              <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
                <PlayerTechnicalFields />
                <PlayerAttributesPreview />
              </div>
            </section>
          </fieldset>
        </form>
      </FormProvider>
    </Modal>
  )
}
