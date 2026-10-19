import { RoutePaths } from '@/router/route-paths'

export const navigationGroups = [
  {
    label: 'Mercados',
    items: [
      { label: 'Jogadores', to: RoutePaths.players },
      { label: 'Clubes', to: RoutePaths.clubs },
    ],
  },
  {
    label: 'Liga',
    items: [
      { label: 'Partidas', to: RoutePaths.matches },
      { label: 'Classificação', to: RoutePaths.standings },
    ],
  },
] as const

export interface SidebarClub {
  id: number
  name: string
}
