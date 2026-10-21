import { ApiPropertyOptional } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { IsIntegerQuery } from '../../../core/validation/query-value.validator.js';

export class ListarPartidasDto {
  @ApiPropertyOptional({
    type: String,
    description:
      'Filtra partidas em que o clube foi mandante ou visitante; somente dígitos, sem zeros à esquerda',
    pattern: '^[1-9]\\d*$',
    example: '1',
  })
  @ValidateIf((_objeto, valor: unknown) => valor !== undefined)
  @IsIntegerQuery({ min: 1, max: 2_147_483_647 })
  club_id?: string;
}
