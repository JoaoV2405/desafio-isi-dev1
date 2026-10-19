import { createFileRoute } from '@tanstack/react-router'
import { MatchesPage } from '@/modules/partidas/pages/matches-page'

export const Route = createFileRoute('/liga/partidas')({
  component: MatchesPage,
})
