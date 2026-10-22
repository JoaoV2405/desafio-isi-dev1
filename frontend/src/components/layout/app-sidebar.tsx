import { Link, useRouterState } from '@tanstack/react-router'
import { Plus, Shield, Swords, Trophy } from 'lucide-react'
import type { SidebarClub } from './navigation'
import { navigationGroups } from './navigation'
import logo from '@/assets/image.png'
import mark from '@/assets/Marca.png'
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
  useSidebar,
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
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center">
        <Link
          to={RoutePaths.home}
          aria-label="Passe. Início"
          className="flex h-10 items-center px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <img
            src={isCollapsed ? mark : logo}
            alt="Passe"
            className={
              isCollapsed
                ? 'size-7 object-contain'
                : 'h-8 w-auto max-w-full object-contain'
            }
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      aria-label={item.label}
                      title={item.label}
                      isActive={
                        pathname === item.to ||
                        pathname.startsWith(`${item.to}/`)
                      }
                      render={<Link to={item.to} />}
                    >
                      <item.icon aria-hidden="true" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarGroup>
          <SidebarGroupLabel className="justify-around group-data-[collapsible=icon]:hidden">
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
                    aria-label={club.name}
                    title={club.name}
                    isActive={pathname === `/mercado/clubes/${club.id}`}
                    render={
                      <Link
                        to={RoutePaths.club}
                        params={{ clubeId: String(club.id) }}
                      />
                    }
                  >
                    <Shield aria-hidden="true" />
                    {!isCollapsed && <span>{club.name}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            {isLoading ? (
              <p
                role="status"
                className="px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden"
              >
                Carregando clubes...
              </p>
            ) : error ? (
              <p
                role="alert"
                className="px-2 py-1 text-xs text-destructive group-data-[collapsible=icon]:hidden"
              >
                {error}
              </p>
            ) : (
              clubs.length === 0 && (
                <p className="px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                  Nenhum clube cadastrado.
                </p>
              )
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter
        className={isCollapsed ? 'p-2' : 'm-2 rounded-xl border bg-card p-3'}
      >
        {isCollapsed ? (
          <div
            role="img"
            aria-label="Liga fictícia e último jogo"
            title="Liga fictícia e último jogo"
            className="flex size-8 items-center justify-center text-muted-foreground"
          >
            <Swords aria-hidden="true" className="size-4" />
          </div>
        ) : (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {['Liga fictícia', 'Último jogo'].map((label) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton
                      render={<div />}
                      className="hover:bg-transparent hover:text-inherit"
                    >
                      {label === 'Último jogo' ? (
                        <Swords aria-hidden="true" />
                      ) : (
                        <Trophy aria-hidden="true" />
                      )}
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
