import type { ReactNode } from 'react'
import type { ModalActionOptions, ModalProps } from './modal'
import { Modal } from './modal'

export interface OperationSuccessDetail {
  label: string
  value: ReactNode
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
      onOpenChange={onOpenChange}
      cancelLabel="Fechar"
      primaryAction={{ ...primaryAction, onClick: continueAfterSuccess }}
    >
      <dl className="divide-y rounded-lg border px-4">
        {details.map(({ label, value }) => (
          <div
            key={label}
            className="grid grid-cols-1 gap-1 py-3 text-sm sm:grid-cols-2 sm:gap-4"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="min-w-0 font-medium wrap-break-word sm:text-right">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {children}
    </Modal>
  )
}
