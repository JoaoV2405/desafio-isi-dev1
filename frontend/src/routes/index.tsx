import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@/modules/inicio/pages/home-page'

export const Route = createFileRoute('/')({
  component: HomePage,
})
