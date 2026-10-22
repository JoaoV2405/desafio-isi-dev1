const criteria = ['Pontos', 'Saldo de gols', 'Gols marcados', 'Nome do clube']

export function StandingsOrderCard() {
  return (
    <section
      aria-labelledby="standings-order-title"
      className="space-y-5 rounded-xl border bg-card p-5"
    >
      <header className="space-y-1">
        <h2 id="standings-order-title" className="text-base font-semibold">
          Ordem da tabela
        </h2>
        <p className="text-xs text-muted-foreground">
          Critérios de classificação, nesta ordem
        </p>
      </header>
      <ol className="space-y-3">
        {criteria.map((criterion, index) => (
          <li key={criterion} className="flex items-center gap-3 text-sm">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
              {index + 1}
            </span>
            {criterion}
          </li>
        ))}
      </ol>
    </section>
  )
}
