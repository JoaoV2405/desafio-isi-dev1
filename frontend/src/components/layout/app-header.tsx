import { Link, useParams, useRouterState } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import type { SidebarClub } from './navigation'
import { navigationGroups } from './navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { RoutePaths } from '@/router/route-paths'

export function AppHeader({ clubs }: { clubs: SidebarClub[] }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { clubeId, partidaId } = useParams({ strict: false })
  
  const group = navigationGroups.find((entry) =>
    entry.items.some(
      (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
    ),
  )
  const item = group?.items.find(
    (entry) => pathname === entry.to || pathname.startsWith(`${entry.to}/`),
  )
  const detailLabel = clubeId
    ? (clubs.find((club) => String(club.id) === clubeId)?.name ??
      `Clube ${clubeId}`)
    : partidaId
      ? `Partida ${partidaId}`
      : undefined

  return (
    <header className="flex min-h-14 items-center gap-3 border-b px-4">
      <SidebarTrigger aria-label="Alternar sidebar" title="Alternar sidebar" />
      <Separator orientation="vertical" className="my-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to={RoutePaths.home} />}>
              Início
            </BreadcrumbLink>
          </BreadcrumbItem>
          {group && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span>{group.label}</span>
              </BreadcrumbItem>
            </>
          )}
          {item && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {detailLabel ? (
                  <BreadcrumbLink render={<Link to={item.to} />}>
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </>
          )}
          {detailLabel && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{detailLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto"
        aria-label="Atualizar página"
        title="Atualizar página"
        onClick={() => window.location.reload()}
      >
        <RefreshCw />
      </Button>
    </header>
  )
}
