import { ApiProperty } from '@nestjs/swagger';
import { JogadorResponse } from '../../jogadores/dto/jogador.response.js';

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

  @ApiProperty({
    type: Number,
    description: 'Soma dos valores de mercado atuais do elenco',
    example: 37,
  })
  squad_value: number;

  @ApiProperty({
    type: Number,
    description: 'Patrimônio atual: caixa somado ao valor do elenco',
    example: 298.15,
  })
  net_worth: number;
}

export class ErroClubeResponse {
  @ApiProperty({
    type: String,
    description: 'Mensagem segura que descreve o erro',
    example: 'Clube não encontrado',
  })
  message: string;
}
export class ContratoElencoResponse {
  @ApiProperty({
    type: Number,
    description: 'Valor pago pelo jogador na compra, sem taxa',
    example: 37,
  })
  purchase_value: number;

  @ApiProperty({
    type: String,
    description: 'Fim da fidelidade no horário de Brasília',
    example: '2027-03-02T10:15:00-03:00',
  })
  loyalty_until: string;

  @ApiProperty({
    type: Number,
    description: 'Dias restantes de fidelidade, arredondados para cima',
    example: 120,
  })
  remaining_days: number;

  @ApiProperty({
    type: Number,
    description: 'Percentual da multa se o jogador fosse vendido agora',
    enum: [0, 5, 10, 20],
    example: 10,
  })
  penalty_rate: number;
}

export class JogadorDoClubeResponse extends JogadorResponse {
  @ApiProperty({
    type: ContratoElencoResponse,
    description: 'Contrato ativo do jogador com o clube',
  })
  contract: ContratoElencoResponse;
}

export class ClubeDetailResponse extends ClubeResponse {
  @ApiProperty({
    type: [JogadorDoClubeResponse],
    description: 'Elenco ordenado por posição, nome normalizado e id',
  })
  players: JogadorDoClubeResponse[];
}
