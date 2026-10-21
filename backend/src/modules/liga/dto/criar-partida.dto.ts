import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class CriarPartidaDto {
  @ApiProperty({
    type: Number,
    description: 'Identificador do clube mandante',
    minimum: 1,
    maximum: Number.MAX_SAFE_INTEGER,
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  home_club_id: number;

  @ApiProperty({
    type: Number,
    description: 'Identificador do clube visitante, distinto do mandante',
    minimum: 1,
    maximum: Number.MAX_SAFE_INTEGER,
    example: 2,
  })
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  away_club_id: number;
}
