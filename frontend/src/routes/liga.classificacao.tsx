import { createFileRoute } from '@tanstack/react-router'
import { StandingsPage } from '@/modules/classificacao/pages/standings-page'

export const Route = createFileRoute('/liga/classificacao')({
  component: StandingsPage,
})
