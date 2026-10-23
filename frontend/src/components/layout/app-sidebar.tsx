import { Link, useRouterState } from '@tanstack/react-router'
import { Clock, Plus, Swords, Trophy } from 'lucide-react'
import type { SidebarClub } from './navigation'
import { navigationGroups } from './navigation'
import { SidebarLatestMatch } from './sidebar-latest-match'
import logo from '@/assets/image.png'
import mark from '@/assets/Marca.png'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { RoutePaths } from '@/router/route-paths'
import { useDashboard } from '@/modules/inicio/hooks/use-dashboard'

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
  const dashboard = useDashboard()
  const counts: Partial<Record<string, number>> = {
    [RoutePaths.players]: dashboard.data?.total_players,
    [RoutePaths.clubs]: dashboard.data?.total_clubs,
    [RoutePaths.matches]: dashboard.data?.total_matches,
  }

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
                      className={item.to in counts ? 'pr-12' : undefined}
                    >
                      <item.icon aria-hidden="true" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </SidebarMenuButton>
                    {item.to in counts && (
                      <SidebarMenuBadge
                        title={
                          counts[item.to] === undefined
                            ? dashboard.isPending
                              ? 'Carregando total...'
                              : 'Total indisponível'
                            : `${counts[item.to]} ${item.label.toLowerCase()}`
                        }
                      >
                        {counts[item.to] ?? '—'}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        {dashboard.isError && (
          <div className="space-y-1 px-4 group-data-[collapsible=icon]:hidden">
            <p
              role="alert"
              className="text-xs whitespace-pre-line text-destructive"
            >
              {dashboard.data && 'Não foi possível atualizar o resumo. '}
              {dashboard.error.message}
            </p>
            <Button
              variant="ghost"
              size="xs"
              disabled={dashboard.isFetching}
              onClick={() => void dashboard.refetch()}
            >
              Tentar novamente
            </Button>
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupLabel className="justify-between group-data-[collapsible=icon]:hidden">
            <span>Clubes</span>
            <Button
              variant="ghost"
              size="icon-xs"
              nativeButton={false}
              render={<Link to={RoutePaths.clubs} search={{ create: true }} />}
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
                    className="group-data-[collapsible=icon]:p-1.5!"
                    render={
                      <Link
                        to={RoutePaths.club}
                        params={{ clubeId: String(club.id) }}
                      />
                    }
                  >
                    <Badge
                      variant="secondary"
                      aria-hidden="true"
                      className="size-5 rounded-md p-0 text-[10px] leading-none font-semibold text-muted-foreground group-data-active/menu-button:bg-primary group-data-active/menu-button:text-primary-foreground"
                    >
                      {club.name.trim().charAt(0).toLocaleUpperCase('pt-BR')}
                    </Badge>
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
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Trophy aria-hidden="true" className="size-4" />
                Liga fictícia
              </p>
              <p className="text-xs text-muted-foreground">
                {dashboard.data?.total_clubs ?? '—'} clubes ·{' '}
                {dashboard.data?.total_players ?? '—'} jogadores
              </p>
              
            </div>
            <SidebarLatestMatch />
            <p className="flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
              <Clock aria-hidden="true" className="size-4 shrink-0" />
              <span>Horário de Brasília (UTC-3)</span>
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
