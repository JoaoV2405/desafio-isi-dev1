import { FORMATION_LAYOUTS } from '@/shared/components/soccer-field/formations.ts'
import type {
  FieldOccupants,
  FieldTeam,
} from '@/shared/components/soccer-field/types'
import type {
  DuelParticipant,
  MatchDetail,
  MatchDuel,
  MatchSummary,
} from '../services/matches-api'

export function formatMatchLabel(match: MatchSummary) {
  return `${match.home.club_name} ${match.home.goals} x ${match.away.goals} ${match.away.club_name}`
}

// RN20: each side's three attacks pair line players 4, 3, 2 with keeper, 1, 2.
// This identifies historical vacancies; it does not recalculate any duel values.
export function getDuelLineOrders(order: MatchDuel['order']) {
  const index = (order - 1) % 3
  return { attacker: 4 - index, defender: index }
}

export function getMatchFieldTeams(match: MatchDetail): {
  home: FieldTeam
  away: FieldTeam
} {
  const participants = {
    home: new Map<number, DuelParticipant>(),
    away: new Map<number, DuelParticipant>(),
  }
  const scorers = { home: new Set<number>(), away: new Set<number>() }

  for (const duel of match.duels) {
    const attackingSide =
      duel.attacking_club_id === match.home.club_id ? 'home' : 'away'
    const defendingSide = attackingSide === 'home' ? 'away' : 'home'
    const ranks = getDuelLineOrders(duel.order)
    participants[attackingSide].set(ranks.attacker, duel.attacker)
    participants[defendingSide].set(ranks.defender, duel.defender)
    if (duel.goal) scorers[attackingSide].add(duel.attacker.player_id)
  }

  function team(side: 'home' | 'away'): FieldTeam {
    const club = match[side]
    const occupants: FieldOccupants = {}
    const slots = FORMATION_LAYOUTS[club.formation]
    if (participants[side].size !== 5) {
      throw new Error(
        'Os titulares históricos desta partida não estão completos.',
      )
    }
    slots.forEach((slot, index) => {
      const player = participants[side].get(index)
      if (!player)
        throw new Error(
          'Os titulares históricos desta partida não estão completos.',
        )
      occupants[slot.id] = {
        id: player.player_id,
        name: player.player_name,
        position: player.position,
        condition: player.condition,
        scored: scorers[side].has(player.player_id),
      }
    })
    return {
      id: club.club_id,
      name: club.club_name,
      formation: club.formation,
      occupants,
    }
  }

  return { home: team('home'), away: team('away') }
}
