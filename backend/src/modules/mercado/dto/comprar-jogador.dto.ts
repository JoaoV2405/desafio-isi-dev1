import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsString, Matches, Max, Min } from 'class-validator';

const FORMATO_DATA_BRASILIA =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}-03:00$/;

export class ComprarJogadorDto {
  @ApiProperty({
    type: Number,
    description: 'Identificador do clube comprador',
    minimum: 1,
    maximum: 2_147_483_647,
    example: 1,
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(2_147_483_647)
  readonly club_id: number;

  @ApiProperty({
    type: String,
    description: 'Fim da fidelidade no formato AAAA-MM-DDTHH:MM-03:00',
    format: 'date-time',
    pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}-03:00$',
    example: '2027-03-02T10:15-03:00',
  })
  @IsDefined()
  @IsString()
  @Matches(FORMATO_DATA_BRASILIA)
  readonly loyalty_until: string;
}
