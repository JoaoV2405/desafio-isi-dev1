import { Clock3 } from 'lucide-react'
import { HomeLeagueSteps } from '../components/home-league-steps'
import { HomeOverview } from '../components/home-overview'
import fieldDecoration from '@/assets/decoracao_campo.svg'

export function HomePage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-6 sm:px-10 sm:py-8">
      <div className="relative isolate flex min-h-[700px] w-full max-w-[1200px] flex-col justify-center gap-6 px-5 py-8 sm:px-8 lg:px-10">
        <img
          src={fieldDecoration}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-[17px] -inset-y-px -z-10 h-[calc(100%+2px)] w-[calc(100%+34px)] max-w-none select-none"
        />

        <HomeOverview />
        <HomeLeagueSteps />

        <footer className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Clock3 aria-hidden="true" className="size-3.5 shrink-0" />
          <span>Liga Fictícia 2026 · Horário de Brasília (UTC−3)</span>
        </footer>
      </div>
    </main>
  )
}
