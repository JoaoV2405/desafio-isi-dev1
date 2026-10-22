import type { ReactNode } from 'react'
import { AppHeader } from './app-header'
import { AppSidebar } from './app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useClubs } from '@/modules/clubes/hooks/use-clubs'

export function AppLayout({ children }: { children: ReactNode }) {
  // Reutiliza a consulta de clubes para preencher navegação e nomes dos breadcrumbs.
  const { data: clubs = [], isPending, error } = useClubs()
  //const {general_data} = useInfoData 

  return (
    <SidebarProvider>
      <AppSidebar clubs={clubs} isLoading={isPending} error={error?.message} />
      <SidebarInset className="min-w-0">
        <AppHeader clubs={clubs} />
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
