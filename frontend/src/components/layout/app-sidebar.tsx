import { Link, useRouterState } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import type { SidebarClub } from './navigation'
import { navigationGroups } from './navigation'
import { IconPlaceholder } from './icon-placeholder'
import logo from '@/assets/image.png'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { RoutePaths } from '@/router/route-paths'

export function AppSidebar({
  clubs,
  isLoading = false,
  error,
}: {
  clubs: SidebarClub[]
  isLoading?: boolean
  error?: string
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <Link to={RoutePaths.home} aria-label="Passe. Início">
          <img src={logo} alt="Passe" className="h-auto w-40 p-2" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      isActive={
                        pathname === item.to ||
                        pathname.startsWith(`${item.to}/`)
                      }
                      render={<Link to={item.to} />}
                    >
                      <IconPlaceholder />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarGroup>
          <SidebarGroupLabel className="justify-around">
            <span>Clubes</span>
            <Button
              variant="ghost"
              size="icon-xs"
              nativeButton={false}
              render={<Link to={RoutePaths.clubs} />}
              aria-label="Adicionar clube"
              title="Adicionar clube"
            >
              <Plus />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clubs.map((club) => (
                <SidebarMenuItem key={club.id}>
                  <SidebarMenuButton
                    isActive={pathname === `/mercado/clubes/${club.id}`}
                    render={
                      <Link
                        to={RoutePaths.club}
                        params={{ clubeId: String(club.id) }}
                      />
                    }
                  >
                    <IconPlaceholder />
                    <span>{club.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            {isLoading ? (
              <p
                role="status"
                className="px-2 py-1 text-xs text-muted-foreground"
              >
                Carregando clubes...
              </p>
            ) : error ? (
              <p role="alert" className="px-2 py-1 text-xs text-destructive">
                {error}
              </p>
            ) : (
              clubs.length === 0 && (
                <p className="px-2 py-1 text-xs text-muted-foreground">
                  Nenhum clube cadastrado.
                </p>
              )
            )}
          </SidebarGroupContent>
        </SidebarGroup>
        {/* novo grupo, no fim da sidebar, 3 itens seguindo o mesmo formato, mas nao são clicaveis  */}
      </SidebarContent>
      <SidebarFooter className="m-2 rounded-xl border bg-card p-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {['Liga fictícia', 'Último jogo'].map((label) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton
                    render={<div />}
                    className="hover:bg-transparent hover:text-inherit"
                  >
                    <IconPlaceholder />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}
