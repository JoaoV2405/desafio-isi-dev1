import { HeartPlus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { FieldPlayer } from '@/shared/components/soccer-field/types'

const namesFormatter = new Intl.ListFormat('pt-BR', {
  style: 'long',
  type: 'conjunction',
})

export function LineupConditionAlert({ players }: { players: FieldPlayer[] }) {
  const affectedPlayers = players.filter(
    ({ condition }) => condition === 'MAL_CONDICIONADO',
  )
  if (affectedPlayers.length === 0) return null

  const names = namesFormatter.format(affectedPlayers.map(({ name }) => name))
  const singular = affectedPlayers.length === 1

  return (
    <Alert variant="warning">
      <HeartPlus aria-hidden="true" />
      <AlertTitle>
        {singular
          ? `Jogador ${names} está mal condicionado`
          : `Jogadores ${names} estão mal condicionados`}
      </AlertTitle>
      <AlertDescription>
        {singular
          ? 'Os atributos deste jogador são reduzidos nas partidas.'
          : 'Os atributos desses jogadores são reduzidos nas partidas.'}
      </AlertDescription>
    </Alert>
  )
}
