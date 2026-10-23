import { useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import logo from '@/assets/image.png'
import { Button } from '@/components/ui/button'
import { RoutePaths } from '@/router/route-paths'

interface HomeIntroductionProps {
  leaderName: string
  leaderPoints: number | undefined
}

export function HomeIntroduction({
  leaderName,
  leaderPoints,
}: HomeIntroductionProps) {
  const navigate = useNavigate()

  useEffect(() => {
    function startWithEnter(event: KeyboardEvent) {
      if (
        event.key !== 'Enter' ||
        event.repeat ||
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return
      if (
        event.target instanceof Element &&
        event.target.closest(
          'a, button, input, select, textarea, [role="button"], [contenteditable]:not([contenteditable="false"])',
        )
      )
        return
      event.preventDefault()
      void navigate({ to: RoutePaths.players })
    }

    window.addEventListener('keydown', startWithEnter)
    return () => window.removeEventListener('keydown', startWithEnter)
  }, [navigate])

  return (
    <>
      <img src={logo} alt="Passe" className="h-9 w-auto object-contain" />
      <div className="mt-3 inline-flex max-w-full items-center justify-center gap-2 rounded-full border bg-white px-3 py-1 text-xs text-muted-foreground">
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full bg-success"
        />
        <span className="wrap-anywhere">
          Liga Fictícia 2026 –{' '}
          {leaderName === 'Sem líder' ? 'Sem líder' : `Líder: ${leaderName}`}
          {leaderName !== 'Sem líder' && leaderName !== '—' && (
            <>, {leaderPoints ?? '—'} pontos</>
          )}
        </span>
      </div>
      <div className="mt-4 max-w-4xl">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl lg:text-[40px]">
          Gestão da liga, do mercado à classificação
        </h1>
        <p className="mx-auto mt-2.5 max-w-[640px] text-sm leading-5 text-muted-foreground">
          Cadastre jogadores, monte os clubes e negocie com contrato de
          fidelidade. Depois, escale os titulares e jogue partidas com placar
          calculado pelos atributos.
        </p>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Button
          size="lg"
          className="h-11 gap-2 rounded-lg px-7 text-base"
          nativeButton={false}
          render={<Link to={RoutePaths.players} />}
        >
          Iniciar
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
        <span className="text-xs text-muted-foreground">
          ou tecle{' '}
          <kbd className="rounded-md bg-muted px-1.5 py-1 font-sans font-medium text-secondary-foreground">
            Enter
          </kbd>
        </span>
      </div>
    </>
  )
}
