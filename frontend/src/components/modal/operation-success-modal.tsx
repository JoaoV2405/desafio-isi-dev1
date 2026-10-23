import { CircleCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ModalActionOptions, ModalProps } from './modal'
import { Modal } from './modal'
import { cn } from '@/lib/utils'

export interface OperationSuccessDetail {
  label: string
  value: ReactNode
  description?: ReactNode
  emphasized?: boolean
}

export interface OperationSuccessModalProps extends Omit<
  ModalProps,
  'children' | 'cancelLabel' | 'isSubmitting' | 'primaryAction'
> {
  details: readonly OperationSuccessDetail[]
  children?: ReactNode
  primaryAction: ModalActionOptions & { onClick: () => void }
}

export function OperationSuccessModal({
  title,
  details,
  children,
  primaryAction,
  onOpenChange,
  ...props
}: OperationSuccessModalProps) {
  function continueAfterSuccess() {
    onOpenChange(false)
    primaryAction.onClick()
  }

  return (
    <Modal
      {...props}
      title={
        <span className="flex flex-col items-start gap-3">
          <CircleCheck aria-hidden="true" className="size-8 text-success" />
          <span>{title}</span>
        </span>
      }
      onOpenChange={onOpenChange}
      cancelLabel="Fechar"
      primaryAction={{ ...primaryAction, onClick: continueAfterSuccess }}
    >
      <dl className="divide-y rounded-xl border px-4">
        {details.map(({ label, value, description, emphasized }) => (
          <div
            key={label}
            className="grid grid-cols-1 gap-1 py-3 text-sm sm:grid-cols-2 sm:gap-4"
          >
            <dt
              className={cn(
                emphasized
                  ? 'font-bold text-foreground'
                  : 'text-muted-foreground',
              )}
            >
              {label}
            </dt>
            <dd
              className={cn(
                'min-w-0 tabular-nums wrap-break-word sm:text-right',
                emphasized ? 'font-bold' : 'font-semibold',
              )}
            >
              {value}
              {description && (
                <p className="mt-1 text-xs font-normal text-muted-foreground">
                  {description}
                </p>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {children}
    </Modal>
  )
}
