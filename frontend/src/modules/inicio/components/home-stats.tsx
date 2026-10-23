import { BadgeCheck, Shield, Swords, UserRound, UsersRound } from 'lucide-react'
import type { DashboardSummary } from '@/shared/services/dashboard-api'

interface HomeStatsProps {
  summary: DashboardSummary | undefined
  isPending: boolean
  isFetching: boolean
}

export function HomeStats({ summary, isPending, isFetching }: HomeStatsProps) {
  const stats = [
    { label: 'jogadores', value: summary?.total_players, icon: UsersRound },
    { label: 'livres', value: summary?.total_free_players, icon: UserRound },
    { label: 'clubes', value: summary?.total_clubs, icon: Shield },
    { label: 'partidas', value: summary?.total_matches, icon: Swords },
  ]

  return (
    <section
      aria-label="Resumo da liga"
      aria-busy={isFetching}
      className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs text-muted-foreground"
    >
      {isPending && (
        <span role="status" className="sr-only">
          Carregando resumo da liga...
        </span>
      )}
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="flex items-center gap-1.5">
          <Icon aria-hidden="true" className="size-4" />
          {value !== undefined ? (
            <span className="font-semibold text-foreground tabular-nums">
              {value}
            </span>
          ) : isPending ? (
            <span
              aria-hidden="true"
              className="h-4 w-5 animate-pulse rounded bg-muted motion-reduce:animate-none"
            />
          ) : (
            <span>—</span>
          )}
          <span>{label}</span>
        </div>
      ))}
      <span className="flex items-center gap-1.5">
        <BadgeCheck aria-hidden="true" className="size-4" />
        Não precisa de login
      </span>
    </section>
  )
}
