import { useId } from 'react'
import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { ErrorAlert } from '@/components/ui/alert'

interface PlayerFormFieldProps extends ComponentProps<typeof Input> {
  label: string
  description?: string
  error?: string
}

export function PlayerFormField({
  label,
  description,
  error,
  id,
  ...props
}: PlayerFormFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = `${inputId}-description`
  const errorId = `${inputId}-error`
  const describedBy = [description ? descriptionId : '', error ? errorId : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>
      <Input
        {...props}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
      />
      {description && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <ErrorAlert id={errorId} title={`${label}: valor inválido`}>
          {error}
        </ErrorAlert>
      )}
    </div>
  )
}
