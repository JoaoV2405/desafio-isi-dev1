import { ApiProperty } from '@nestjs/swagger';

export class ClubeResponse {
  @ApiProperty({
    type: Number,
    description: 'Identificador único do clube',
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: String,
    description: 'Nome normalizado do clube',
    example: 'Águias FC',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'Sigla do clube',
    example: 'AGU',
  })
  acronym: string;

  @ApiProperty({
    type: Number,
    description: 'Caixa atual do clube',
    example: 300,
  })
  cash: number;
}

export class ErroClubeResponse {
  @ApiProperty({
    type: String,
    description: 'Mensagem segura que descreve o erro',
    example: 'Clube não encontrado',
  })
  message: string;
}
