import type { ReactNode } from 'react'
import type { SidebarClub } from './navigation'
import { AppHeader } from './app-header'
import { AppSidebar } from './app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export function AppLayout({ children }: { children: ReactNode }) {
  const clubs: SidebarClub[] = []

  // Integração futura: substituir a lista vazia pela consulta da API.
  // import { useQuery } from '@tanstack/react-query'
  // const { data: clubs = [] } = useQuery({
  //   queryKey: ['clubs'],
  //   queryFn: async (): Promise<SidebarClub[]> => {
  //     const apiOrigin = import.meta.env.VITE_API_ORIGIN ?? ''
  //     const response = await fetch(`${apiOrigin}/api/v1/clubes`)
  //     if (!response.ok) throw new Error('Não foi possível carregar os clubes.')
  //     // Adaptar a resposta ao formato SidebarClub conforme o contrato da API.
  //     return response.json()
  //   },
  // })

  return (
    <SidebarProvider>
      <AppSidebar clubs={clubs} />
      <SidebarInset className="min-w-0">
        <AppHeader clubs={clubs} />
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
