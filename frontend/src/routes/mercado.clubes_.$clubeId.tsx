import { createFileRoute } from '@tanstack/react-router'
import { ClubPage } from '@/modules/clubes/pages/club-page'

export const Route = createFileRoute('/mercado/clubes_/$clubeId')({
  component: ClubRoute,
})

function ClubRoute() {
  const { clubeId } = Route.useParams()

  return <ClubPage key={clubeId} clubId={clubeId} />
}
