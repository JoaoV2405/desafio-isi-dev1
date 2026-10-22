import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { ContentState } from './content-state'
import type { ContentStateProps } from './content-state'
import { isConnectionError } from '@/shared/lib/api-error'
import { RoutePaths } from '@/router/route-paths'

interface ContentErrorStateProps extends Pick<
  ContentStateProps,
  'title' | 'className'
> {
  error: unknown
}

export function ContentErrorState({
  error,
  title,
  className,
}: ContentErrorStateProps) {
  const router = useRouter()
  const [isReloading, setIsReloading] = useState(false)
  const connectionError = isConnectionError(error)

  function handleAction() {
    if (connectionError) {
      setIsReloading(true)
      window.location.reload()
    } else if (router.history.canGoBack()) {
      router.history.back()
    } else {
      void router.navigate({ to: RoutePaths.home, replace: true })
    }
  }

  return (
    <ContentState
      variant="error"
      title={title}
      description={
        error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
      }
      className={className}
      action={{
        label: connectionError ? 'Recarregar página' : 'Voltar',
        onClick: handleAction,
        isPending: isReloading,
        pendingLabel: 'Recarregando...',
      }}
    />
  )
}
