import { createFileRoute } from '@tanstack/react-router'
import { PlayersPage } from '@/modules/jogadores/pages/players-page'

export const Route = createFileRoute('/mercado/jogadores')({
  component: PlayersPage,
})
