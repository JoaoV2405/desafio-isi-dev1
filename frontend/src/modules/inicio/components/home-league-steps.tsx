import {
  ChevronRight,
  HandCoins,
  History,
  Shield,
  ShoppingCart,
  Trophy,
  UsersRound,
} from 'lucide-react'

const leagueSteps = [
  {
    title: 'Jogadores',
    description:
      'Nascem livres e Apto; o valor de mercado vem da condição, agilidade e idade.',
    icon: UsersRound,
  },
  {
    title: 'Clubes',
    description: 'Começam com 300,00 em caixa e sem jogadores.',
    icon: Shield,
  },
  {
    title: 'Compra',
    description: 'Valor + taxa, até 50% do caixa, com contrato de fidelidade.',
    icon: ShoppingCart,
  },
  {
    title: 'Venda',
    description: 'Multa antes do fim da fidelidade e comissão sobre o lucro.',
    icon: HandCoins,
  },
  {
    title: 'Histórico',
    description: 'Toda compra e venda fica registrada, com totais e CSV.',
    icon: History,
  },
  {
    title: 'Liga',
    description:
      'Escale 5 titulares e jogue partidas que entram na classificação.',
    icon: Trophy,
  },
]

export function HomeLeagueSteps() {
  return (
    <section aria-label="Como funciona a liga">
      <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {leagueSteps.map(({ title, description, icon: Icon }, index) => (
          <li key={title} className="relative rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <span className="text-xs font-medium text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <h2 className="mt-3 text-sm font-semibold">{title}</h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
            {index < leagueSteps.length - 1 && (
              <ChevronRight
                aria-hidden="true"
                className="absolute top-1/2 -right-5 hidden size-4 -translate-y-1/2 text-muted-foreground lg:block"
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
