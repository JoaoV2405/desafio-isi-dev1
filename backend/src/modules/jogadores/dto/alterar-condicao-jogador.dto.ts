import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum } from 'class-validator';
import { CondicaoJogador } from '../entities/jogador.entity.js';

export class AlterarCondicaoJogadorDto {
  @ApiProperty({
    type: String,
    description: 'Nova condição física do jogador',
    enum: CondicaoJogador,
    example: CondicaoJogador.MalCondicionado,
  })
  @IsDefined()
  @IsEnum(CondicaoJogador)
  readonly condition: CondicaoJogador;

  constructor(condition: CondicaoJogador) {
    this.condition = condition;
  }
}
