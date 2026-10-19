import { ApiProperty } from '@nestjs/swagger';
import { FormacaoClube } from '../../clubes/entities/clube.entity.js';
import { JogadorResponse } from '../../jogadores/dto/jogador.response.js';

export class EscalacaoResponse {
  @ApiProperty({ type: Number, description: 'Identificador do clube' })
  club_id: number;

  @ApiProperty({
    type: String,
    description: 'Formação atual, nula até a primeira escalação',
    enum: FormacaoClube,
    nullable: true,
  })
  formation: FormacaoClube | null;

  @ApiProperty({
    type: Boolean,
    description: 'Indica se os cinco titulares válidos fecham a formação',
  })
  complete: boolean;

  @ApiProperty({
    type: [JogadorResponse],
    description:
      'Titulares atuais, ordenados por posição, nome normalizado e identificador',
  })
  players: JogadorResponse[];
}
