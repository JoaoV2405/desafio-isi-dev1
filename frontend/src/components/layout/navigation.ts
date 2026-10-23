import { Shield, Swords, ListOrdered, UsersRound } from 'lucide-react'
import { RoutePaths } from '@/router/route-paths'

export const navigationGroups = [
  {
    label: 'Mercados',
    items: [
      { label: 'Jogadores', to: RoutePaths.players, icon: UsersRound },
      { label: 'Clubes', to: RoutePaths.clubs, icon: Shield },
    ],
  },
  {
    label: 'Liga',
    items: [
      { label: 'Partidas', to: RoutePaths.matches, icon: Swords },
      { label: 'Classificação', to: RoutePaths.standings, icon: ListOrdered },
    ],
  },
] as const

export interface SidebarClub {
  id: number
  name: string
}
