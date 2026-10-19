import type { ErrorComponentProps } from '@tanstack/react-router'
import { Link, useRouter } from '@tanstack/react-router'

import { RoutePaths } from './route-paths'

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
  return (
    <main className="p-8">
      <h1>Página não encontrada</h1>
      <Link to={RoutePaths.home}>Voltar ao início</Link>
    </main>
  )
}
