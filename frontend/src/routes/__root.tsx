import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'

import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AppLayout } from '@/components/layout/app-layout'
import { Toaster } from '@/components/ui/toast'
import { RoutePaths } from '@/router/route-paths'

export function RootLayout() {
  const isHome = useRouterState({
    // O layout acompanha o conteúdo do Outlet, mesmo enquanto a próxima rota carrega.
    select: (state) =>
      state.matches.some((match) => match.routeId === RoutePaths.home),
  })

  return (
    <Toaster>
      {isHome ? (
        <Outlet />
      ) : (
        <AppLayout>
          <Outlet />
        </AppLayout>
      )}
      {import.meta.env.DEV && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
    </Toaster>
  )
}
export const Route = createRootRoute({ component: RootLayout })
