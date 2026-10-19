import { useId, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { CreatePlayerFormValues } from '../../lib/create-player-form'
import { getDefaultCreatePlayerFormValues } from '../../lib/create-player-form'
import { PlayerAttributesPreview } from '../player-attributes-preview'
import { PlayerGeneralFields } from '../player-general-fields'
import { PlayerFormField } from '../player-form-field'
import { PlayerTechnicalFields } from '../player-technical-fields'
import { Modal } from '@/components/modal/modal'
import { Separator } from '@/components/ui/separator'

interface CreatePlayerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePlayerModal({
  open,
  onOpenChange,
}: CreatePlayerModalProps) {
  const formId = useId()
  // Centraliza valores, erros e foco; valida ao sair do campo e ao corrigir campos já tocados.
  const form = useForm<CreatePlayerFormValues>({
    defaultValues: getDefaultCreatePlayerFormValues(),
    mode: 'onTouched',
  })
  // Este estado controla somente o aviso visual; os dados ficam no React Hook Form.
  const [isValidated, setIsValidated] = useState(false)
  // handleSubmit bloqueia dados inválidos e foca o primeiro erro antes de executar a ação.
  const submitForm = form.handleSubmit(
    () => {
      // Integração do cadastro será adicionada em uma próxima etapa.
      setIsValidated(true)
    },
    () => setIsValidated(false),
  )

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Novo jogador"
      subtitle="Informe os dados pessoais e os indicadores técnicos do jogador."
      className="max-w-5xl"
      primaryAction={{ label: 'Cadastrar jogador', formId }}
      // Usa o estado de envio do formulário para bloquear ações do modal durante o envio.
      isSubmitting={form.formState.isSubmitting}
    >
      {/* Distribui os métodos aos campos e à prévia sem repassar valores e eventos por props. */}
      <FormProvider {...form}>
        <form
          id={formId}
          noValidate
          onSubmit={submitForm}
          // Invalida o aviso anterior quando qualquer dado é alterado.
          onChange={() => setIsValidated(false)}
          className="space-y-6"
        >
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
                Indicadores Técnicos
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
