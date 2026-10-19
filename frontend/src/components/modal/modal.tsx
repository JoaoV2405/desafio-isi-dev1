import { useRef } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { LoaderCircle, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ModalActionOptions {
  label: ReactNode
  pendingLabel?: ReactNode
  disabled?: boolean
  variant?: 'default' | 'destructive'
}

export type ModalPrimaryAction = ModalActionOptions &
  (
    | { onClick: () => void; formId?: never }
    | { formId: string; onClick?: never }
  )

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  primaryAction: ModalPrimaryAction
  cancelLabel?: string
  isSubmitting?: boolean
  className?: string
  initialFocus?: Dialog.Popup.Props['initialFocus']
  finalFocus?: Dialog.Popup.Props['finalFocus']
}

export function Modal({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  primaryAction,
  cancelLabel = 'Cancelar',
  isSubmitting = false,
  className,
  initialFocus,
  finalFocus,
}: ModalProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  function changeOpen(
    nextOpen: boolean,
    details: Dialog.Root.ChangeEventDetails,
  ) {
    if (!nextOpen && isSubmitting) {
      details.cancel()
      return
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={changeOpen}
      disablePointerDismissal={isSubmitting}
      modal
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          data-slot="modal-backdrop"
          className="fixed inset-0 z-50 bg-black/50"
        />
        <Dialog.Popup
          ref={popupRef}
          data-slot="modal"
          initialFocus={initialFocus ?? popupRef}
          finalFocus={finalFocus}
          aria-busy={isSubmitting}
          className={cn(
            'fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border bg-background text-foreground shadow-lg outline-none',
            className,
          )}
        >
          <header
            data-slot="modal-header"
            className="flex shrink-0 items-start justify-between gap-4 border-b p-6"
          >
            <div className="min-w-0 space-y-1">
              <Dialog.Title className="text-lg font-semibold">
                {title}
              </Dialog.Title>
              {subtitle != null && (
                <Dialog.Description
                  render={<div />}
                  className="text-sm text-muted-foreground"
                >
                  {subtitle}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              disabled={isSubmitting}
              aria-label="Fechar modal"
              render={<Button type="button" variant="ghost" size="icon-sm" />}
            >
              <X aria-hidden="true" />
            </Dialog.Close>
          </header>
          <div
            data-slot="modal-body"
            className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6"
          >
            {children}
          </div>
          <footer
            data-slot="modal-footer"
            className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t px-6 py-4"
          >
            <Dialog.Close
              disabled={isSubmitting}
              render={<Button type="button" variant="outline" />}
            >
              {cancelLabel}
            </Dialog.Close>
            <Button
              type={primaryAction.formId ? 'submit' : 'button'}
              form={primaryAction.formId}
              variant={primaryAction.variant ?? 'default'}
              disabled={isSubmitting || primaryAction.disabled}
              onClick={primaryAction.onClick}
            >
              {isSubmitting && (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin motion-reduce:animate-none"
                />
              )}
              {isSubmitting
                ? (primaryAction.pendingLabel ?? 'Processando...')
                : primaryAction.label}
            </Button>
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
