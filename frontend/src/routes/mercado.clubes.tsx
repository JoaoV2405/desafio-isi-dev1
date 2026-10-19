import { createFileRoute } from '@tanstack/react-router'
import { ClubsPage } from '@/modules/clubes/pages/clubs-page'

export const Route = createFileRoute('/mercado/clubes')({
  component: ClubsPage,
})
