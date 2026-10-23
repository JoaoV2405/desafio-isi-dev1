import { Fragment } from 'react'
import { Check } from 'lucide-react'
import type {
  DuelParticipant,
  MatchDetail,
  MatchDuel,
} from '../services/matches-api'
import { getDuelLineOrders } from '../lib/match-presentation'
import { ClubIdentity } from '@/shared/components/club-identity'
import { PlayerIdentity } from '@/shared/components/player-identity'
import { PLAYER_CONDITIONS } from '@/shared/types/player'
import type { ClubSummary } from '@/shared/types/club'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import './match-duels-table.css'

const attributeLabels: Record<DuelParticipant['attribute'], string> = {
  shooting: 'Finalização',
  passing: 'Passe',
  dribbling: 'Drible',
  defending: 'Defesa',
}

function Participant({
  player,
  lineOrder,
  clubName,
}: {
  player: DuelParticipant
  lineOrder: number
  clubName: string
}) {
  return (
    <div title={`Condição na partida: ${PLAYER_CONDITIONS[player.condition]}`}>
      <PlayerIdentity
        playerId={player.player_id}
        name={player.player_name}
        position={player.position}
        description={
          <>
            {player.position},{' '}
            {lineOrder === 0 ? 'Goleiro' : `${lineOrder}º de linha`} ·{' '}
            {clubName}
            <span className="sr-only">
              {' '}
              · {PLAYER_CONDITIONS[player.condition]}
            </span>
          </>
        }
      />
    </div>
  )
}

function Attribute({ player }: { player: DuelParticipant }) {
  return (
    <span className="text-muted-foreground">
      {attributeLabels[player.attribute]}{' '}
      <strong className="font-bold text-black">{player.value}</strong>
    </span>
  )
}

function DuelRow({ duel, match }: { duel: MatchDuel; match: MatchDetail }) {
  const homeAttacks = duel.attacking_club_id === match.home.club_id
  const attackingClub = homeAttacks ? match.home : match.away
  const defendingClub = homeAttacks ? match.away : match.home
  const ranks = getDuelLineOrders(duel.order)
  return (
    <TableRow>
      <TableCell>
        <span className="inline-flex size-8 items-center justify-center rounded-lg bg-muted font-medium">
          {duel.order}
        </span>
      </TableCell>
      <TableCell>
        <Participant
          player={duel.attacker}
          lineOrder={ranks.attacker}
          clubName={attackingClub.club_name}
        />
      </TableCell>
      <TableCell>
        <Attribute player={duel.attacker} />
      </TableCell>
      <TableCell>
        <Participant
          player={duel.defender}
          lineOrder={ranks.defender}
          clubName={defendingClub.club_name}
        />
      </TableCell>
      <TableCell>
        <Attribute player={duel.defender} />
      </TableCell>
      <TableCell>
        {duel.goal ? (
          <Badge variant="success">
            <Check aria-hidden="true" />
            Gol
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-white">
            Sem gol
          </Badge>
        )}
      </TableCell>
    </TableRow>
  )
}

export function MatchDuelsTable({
  match,
  clubs = [],
}: {
  match: MatchDetail
  clubs?: ClubSummary[]
}) {
  return (
    <section
      aria-labelledby="match-duels-title"
      className="overflow-hidden rounded-xl border bg-card"
    >
      <header className="space-y-1 border-b p-5">
        <h2 id="match-duels-title" className="text-base font-semibold">
          Duelos
        </h2>
        <p className="text-xs text-muted-foreground">
          Primeiro, os três ataques do mandante; depois, os três ataques do
          visitante.
        </p>
      </header>
      <div className="match-duels-table">
        <Table aria-label="Os seis duelos da partida">
          <TableHeader>
            <TableRow>
              {[
                'Duelo',
                'Atacante',
                'Ataque',
                'Defensor',
                'Defesa',
                'Resultado',
              ].map((title) => (
                <TableHead key={title} scope="col">
                  {title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {match.duels.map((duel, index) => {
              const startsGroup =
                index === 0 ||
                match.duels[index - 1].attacking_club_id !==
                  duel.attacking_club_id
              const home = duel.attacking_club_id === match.home.club_id
              const club = home ? match.home : match.away
              return (
                <Fragment key={duel.order}>
                  {startsGroup && (
                    <TableRow className="bg-muted-subtle hover:bg-muted-subtle">
                      <TableCell colSpan={6}>
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <ClubIdentity
                              club={{
                                id: club.club_id,
                                name: club.club_name,
                                acronym:
                                  clubs.find((item) => item.id === club.club_id)
                                    ?.acronym ?? '—',
                              }}
                            />
                            <span className="text-xs text-muted-foreground">
                              ({home ? 'Mandante' : 'Visitante'})
                            </span>
                          </div>
                          <span className="font-semibold">
                            {club.goals} {club.goals === 1 ? 'gol' : 'gols'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  <DuelRow duel={duel} match={match} />
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
