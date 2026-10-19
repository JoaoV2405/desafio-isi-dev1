import { createFileRoute } from '@tanstack/react-router'
import { MatchPage } from '@/modules/partidas/pages/match-page'

export const Route = createFileRoute('/liga/partidas_/$partidaId')({
  component: MatchRoute,
})

function MatchRoute() {
  const { partidaId } = Route.useParams()

  return <MatchPage matchId={partidaId} />
}
