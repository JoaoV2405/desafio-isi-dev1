import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'

import { routeTree } from '@/routeTree.gen'
import {
  RouterErrorComponent,
  RouterNotFoundComponent,
  RouterPendingComponent,
} from '@/router/default-route-ui'
import { queryClient } from '@/router/query-client'

const router = createRouter({
  routeTree,
  trailingSlash: 'never',
  scrollRestoration: true,
  defaultPreload: 'intent',
  context: { queryClient },
  defaultPendingComponent: RouterPendingComponent,
  defaultErrorComponent: RouterErrorComponent,
  defaultNotFoundComponent: RouterNotFoundComponent,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
