import { ApiProperty } from '@nestjs/swagger';
import { FormacaoClube } from '../../clubes/entities/clube.entity.js';
import {
  CondicaoJogador,
  PosicaoJogador,
} from '../../jogadores/entities/jogador.entity.js';
import {
  AtributoDuelo,
  type CondicaoDuelo,
} from '../entities/duelo-partida.entity.js';
import type { ResultadoPartida } from '../types/partida.types.js';

export class ClubePartidaResponse {
  @ApiProperty({ type: Number, description: 'Identificador do clube' })
  club_id: number;

  @ApiProperty({ type: String, description: 'Nome do clube' })
  club_name: string;

  @ApiProperty({
    type: String,
    description: 'Formação no momento da partida',
    enum: FormacaoClube,
  })
  formation: FormacaoClube;

  @ApiProperty({
    type: Number,
    description: 'Gols marcados nos três ataques',
    minimum: 0,
    maximum: 3,
  })
  goals: number;
}

export class ParticipanteDueloResponse {
  @ApiProperty({
    type: Number,
    description: 'Identificador histórico do jogador',
  })
  player_id: number;

  @ApiProperty({
    type: String,
    description: 'Nome do jogador no momento da partida',
  })
  player_name: string;

  @ApiProperty({
    type: String,
    description: 'Posição do jogador no momento da partida',
    enum: PosicaoJogador,
  })
  position: PosicaoJogador;

  @ApiProperty({
    type: String,
    description: 'Condição usada no duelo',
    enum: [CondicaoJogador.Apto, CondicaoJogador.MalCondicionado],
  })
  condition: CondicaoDuelo;

  @ApiProperty({
    type: String,
    description: 'Atributo utilizado na comparação',
    enum: AtributoDuelo,
  })
  attribute: AtributoDuelo;

  @ApiProperty({
    type: Number,
    description: 'Valor efetivamente comparado, após o efeito da condição',
    minimum: 1,
    maximum: 99,
  })
  value: number;
}

export class DueloPartidaResponse {
  @ApiProperty({
    type: Number,
    description: 'Ordem do duelo, de 1 a 6',
    minimum: 1,
    maximum: 6,
  })
  order: number;

  @ApiProperty({
    type: Number,
    description: 'Identificador do clube que ataca',
  })
  attacking_club_id: number;

  @ApiProperty({
    type: ParticipanteDueloResponse,
    description: 'Snapshot do atacante',
  })
  attacker: ParticipanteDueloResponse;

  @ApiProperty({
    type: ParticipanteDueloResponse,
    description: 'Snapshot do defensor',
  })
  defender: ParticipanteDueloResponse;

  @ApiProperty({
    type: Boolean,
    description: 'Indica ataque estritamente maior que a defesa',
  })
  goal: boolean;
}

export class PartidaResumoResponse {
  @ApiProperty({ type: Number, description: 'Identificador da partida' })
  id: number;

  @ApiProperty({
    type: String,
    description: 'Instante do servidor em Brasília, com offset fixo -03:00',
    format: 'date-time',
    pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}-03:00$',
    example: '2026-10-20T16:00:00-03:00',
  })
  played_at: string;

  @ApiProperty({
    type: ClubePartidaResponse,
    description: 'Clube mandante e seu placar histórico',
  })
  home: ClubePartidaResponse;

  @ApiProperty({
    type: ClubePartidaResponse,
    description: 'Clube visitante e seu placar histórico',
  })
  away: ClubePartidaResponse;

  @ApiProperty({
    type: String,
    description: 'Resultado derivado do placar persistido',
    enum: ['MANDANTE', 'VISITANTE', 'EMPATE'],
  })
  result: ResultadoPartida;
}

export class PartidaDetalheResponse extends PartidaResumoResponse {
  @ApiProperty({
    type: [DueloPartidaResponse],
    description: 'Os seis duelos históricos, em ordem crescente',
    minItems: 6,
    maxItems: 6,
  })
  duels: DueloPartidaResponse[];
}
