import type { ClubDetails, ClubPlayerContract } from '../types/club-details'
import type { Player } from '@/shared/types/player'
import clubs from './clubs.json'
import contracts from './contracts.json'
import playerFixtures from '@/modules/jogadores/data/players.json'

const players = playerFixtures.players as Player[]
const contractsByPlayerId: Partial<Record<string, ClubPlayerContract>> =
  contracts

export function getMockClub(clubId: string): ClubDetails | null {
  const club = clubs.find((entry) => String(entry.id) === clubId)
  if (!club) return null

  return {
    ...club,
    players: players
      .filter((player) => player.club_id === club.id)
      .map((player) => {
        const contract = contractsByPlayerId[String(player.id)]
        if (!contract) {
          throw new Error(
            `Não foi possível carregar o contrato de ${player.name}.`,
          )
        }
        return { ...player, contract }
      }),
  }
}
