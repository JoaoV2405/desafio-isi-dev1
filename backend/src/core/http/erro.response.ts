import { ApiProperty } from '@nestjs/swagger';

export class ErroResponse {
  @ApiProperty({
    type: String,
    description: 'Mensagem segura que descreve o erro',
    example: 'O campo informado possui um valor inválido',
  })
  message: string;
}
