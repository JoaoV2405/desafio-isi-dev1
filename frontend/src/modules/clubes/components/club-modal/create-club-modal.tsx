import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { Shield, Wallet } from 'lucide-react'
import type { CreateClubInput } from '../../types/club-input'
import { Modal } from '@/components/modal/modal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { formatMoney } from '@/shared/lib/format-money'

interface CreateClubModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (input: CreateClubInput) => void
  isSubmitting?: boolean
  error?: string
}

export function CreateClubModal({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  error,
}: CreateClubModalProps) {
  const formId = useId()
  const nameId = `${formId}-name`
  const acronymId = `${formId}-acronym`
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateClubInput>({
    defaultValues: { name: '', acronym: '' },
    mode: 'onTouched',
  })
  const submitForm = handleSubmit((values) => {
    if (!isSubmitting) onConfirm(values)
  })

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Criar clube"
      subtitle="Informe o nome e a sigla para cadastrar um novo clube na liga."
      primaryAction={{
        label: 'Criar clube',
        pendingLabel: 'Criando clube...',
        formId,
      }}
      isSubmitting={isSubmitting || isFormSubmitting}
    >
      <form id={formId} noValidate onSubmit={submitForm} className="space-y-6">
        <fieldset disabled={isSubmitting} className="min-w-0 space-y-6">
          <div className="space-y-2">
            <label htmlFor={nameId} className="block text-sm font-medium">
              Nome do clube
            </label>
            <InputGroup>
              <InputGroupAddon>
                <Shield aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                {...register('name', {
                  required: 'Informe o nome do clube.',
                  setValueAs: (value: string) =>
                    value.trim().replace(/ {2,}/g, ' '),
                  minLength: {
                    value: 3,
                    message: 'O nome deve ter de 3 a 60 caracteres.',
                  },
                  maxLength: {
                    value: 60,
                    message: 'O nome deve ter de 3 a 60 caracteres.',
                  },
                })}
                id={nameId}
                placeholder="Ex.: Águias Futebol Clube"
                autoComplete="off"
                required
                aria-invalid={Boolean(errors.name)}
                aria-describedby={`${nameId}-description${errors.name ? ` ${nameId}-error` : ''}`}
              />
            </InputGroup>
            <p
              id={`${nameId}-description`}
              className="text-xs text-muted-foreground"
            >
              De 3 a 60 caracteres e de 2 a 5 palavras. Use apenas letras,
              espaços, hífen ou ponto. O nome deve ser único na liga.
            </p>
            {errors.name && (
              <Alert id={`${nameId}-error`} variant="destructive">
                <AlertDescription>{errors.name.message}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor={acronymId} className="block text-sm font-medium">
              Sigla
            </label>
            <Input
              {...register('acronym', {
                required: 'Informe a sigla do clube.',
                pattern: {
                  value: /^[A-Z]{3}$/,
                  message:
                    'Use exatamente 3 letras maiúsculas de A a Z, sem acento.',
                },
              })}
              id={acronymId}
              placeholder="Ex.: AFC"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              required
              maxLength={3}
              aria-invalid={Boolean(errors.acronym)}
              aria-describedby={`${acronymId}-description${errors.acronym ? ` ${acronymId}-error` : ''}`}
            />
            <p
              id={`${acronymId}-description`}
              className="text-xs text-muted-foreground"
            >
              Exatamente 3 letras maiúsculas de A a Z, sem acento. Elas devem
              aparecer no nome nessa ordem, ignorando acentos, e começar pela
              primeira letra do nome. Não podem ser todas iguais, e a sigla deve
              ser única na liga.
            </p>
            {errors.acronym && (
              <Alert id={`${acronymId}-error`} variant="destructive">
                <AlertDescription>{errors.acronym.message}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4">
            <Wallet
              aria-hidden="true"
              className="size-5 shrink-0 text-muted-foreground"
            />
            <p className="text-sm">
              O clube começa com{' '}
              <span className="font-semibold tabular-nums">
                {formatMoney(300)} moedas
              </span>{' '}
              de caixa.
            </p>
          </div>
        </fieldset>
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="whitespace-pre-line">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </form>
    </Modal>
  )
}
