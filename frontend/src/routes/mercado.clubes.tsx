import { createFileRoute } from '@tanstack/react-router'
import { ClubsPage } from '@/modules/clubes/pages/clubs-page'

export const Route = createFileRoute('/mercado/clubes')({
  validateSearch: (search: Record<string, unknown>): { create?: true } =>
    search.create === true || search.create === 'true' ? { create: true } : {},
  component: ClubsPage,
})
