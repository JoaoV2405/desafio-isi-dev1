import { ApiProperty } from '@nestjs/swagger';

export class ClassificacaoResponse {
  @ApiProperty({
    type: 'integer',
    description: 'Posição sequencial na classificação',
    minimum: 1,
  })
  position: number;

  @ApiProperty({
    type: 'integer',
    description: 'Identificador do clube',
    minimum: 1,
  })
  club_id: number;

  @ApiProperty({ type: String, description: 'Nome do clube' })
  club_name: string;

  @ApiProperty({
    type: 'integer',
    description: 'Total de jogos disputados',
    minimum: 0,
  })
  played: number;

  @ApiProperty({
    type: 'integer',
    description: 'Total de vitórias',
    minimum: 0,
  })
  wins: number;

  @ApiProperty({ type: 'integer', description: 'Total de empates', minimum: 0 })
  draws: number;

  @ApiProperty({
    type: 'integer',
    description: 'Total de derrotas',
    minimum: 0,
  })
  losses: number;

  @ApiProperty({
    type: 'integer',
    description: 'Total de gols marcados',
    minimum: 0,
  })
  goals_for: number;

  @ApiProperty({
    type: 'integer',
    description: 'Total de gols sofridos',
    minimum: 0,
  })
  goals_against: number;

  @ApiProperty({
    type: 'integer',
    description: 'Gols marcados menos gols sofridos; pode ser negativo',
  })
  goal_difference: number;

  @ApiProperty({
    type: 'integer',
    description: 'Pontuação: três por vitória e um por empate',
    minimum: 0,
  })
  points: number;
}
