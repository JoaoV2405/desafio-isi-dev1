import { ApiProperty } from '@nestjs/swagger';

export class ResumoInicioResponse {
  @ApiProperty({
    type: 'integer',
    description: 'Total de jogadores não excluídos',
    minimum: 0,
  })
  total_players: number;

  @ApiProperty({
    type: 'integer',
    description: 'Total de jogadores não excluídos sem clube',
    minimum: 0,
  })
  total_free_players: number;

  @ApiProperty({
    type: 'integer',
    description: 'Total de clubes cadastrados',
    minimum: 0,
  })
  total_clubs: number;

  @ApiProperty({
    type: 'integer',
    description: 'Total de partidas registradas',
    minimum: 0,
  })
  total_matches: number;

  @ApiProperty({
    type: String,
    description: 'Nome do primeiro clube da classificação; null sem clubes',
    nullable: true,
  })
  leader: string | null;
}
