import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'

import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AppLayout } from '@/components/layout/app-layout'
import { RoutePaths } from '@/router/route-paths'

export function RootLayout() {
  const isHome = useRouterState({
    select: (state) => state.location.pathname === RoutePaths.home,
  })

  return (
    <>
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
    </>
  )
}
export const Route = createRootRoute({ component: RootLayout })
