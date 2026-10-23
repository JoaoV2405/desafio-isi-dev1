import type { ErrorComponentProps } from '@tanstack/react-router'
import { useRouter } from '@tanstack/react-router'

import { RoutePaths } from './route-paths'
import { ContentState } from '@/components/custom/content-state'

export function RouterPendingComponent() {
  return <p className="p-8">Carregando...</p>
}

export function RouterErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  const errorMessage =
    error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'

  const handleRetry = () => {
    reset()
    void router.invalidate()
  }

  return (
    <main className="p-8">
      <h1>Algo deu errado</h1>
      <p>{errorMessage}</p>
      <button type="button" onClick={handleRetry}>
        Tentar novamente
      </button>
    </main>
  )
}

export function RouterNotFoundComponent() {
  const router = useRouter()

  return (
    <main className="p-8">
      <ContentState
        variant="error"
        title="Página não encontrada"
        description="A página que você tentou acessar não existe."
        action={{
          label: 'Voltar ao início',
          onClick: () => {
            void router.navigate({ to: RoutePaths.home })
          },
        }}
      />
    </main>
  )
}
