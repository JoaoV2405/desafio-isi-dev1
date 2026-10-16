import { ApiProperty } from '@nestjs/swagger';
import { TipoTransacao } from '../entities/transacao.entity.js';
import { SituacaoContrato } from '../entities/contrato.entity.js';

export class ErroMercadoResponse {
  @ApiProperty({
    type: String,
    description: 'Mensagem segura que descreve o erro',
    example: 'O recurso solicitado não foi encontrado',
  })
  message: string;
}

export class TransacaoResponse {
  @ApiProperty({ type: Number, description: 'Identificador da transação' })
  id: number;

  @ApiProperty({ type: Number, description: 'Identificador do clube' })
  club_id: number;

  @ApiProperty({ type: Number, description: 'Identificador do jogador' })
  player_id: number;

  @ApiProperty({ type: String, description: 'Nome do jogador no momento' })
  player_name: string;

  @ApiProperty({ enum: TipoTransacao, description: 'Tipo da operação' })
  type: TipoTransacao;

  @ApiProperty({ type: Number, description: 'Valor de mercado no momento' })
  value: number;

  @ApiProperty({ type: Number, description: 'Taxa ou comissão' })
  fee: number;

  @ApiProperty({ type: Number, description: 'Multa por fidelidade' })
  penalty: number;

  @ApiProperty({
    type: Number,
    description: 'Lucro da venda ou nulo na compra',
    nullable: true,
  })
  profit: number | null;

  @ApiProperty({ type: Number, description: 'Variação do caixa do clube' })
  cash_change: number;

  @ApiProperty({
    type: String,
    description: 'Momento da operação no horário de Brasília',
    format: 'date-time',
  })
  created_at: string;
}

export class ContratoCompraResponse {
  @ApiProperty({ type: Number, description: 'Valor de mercado pago' })
  purchase_value: number;

  @ApiProperty({
    type: String,
    description: 'Fim da fidelidade no horário de Brasília',
    format: 'date-time',
  })
  loyalty_until: string;

  @ApiProperty({ enum: SituacaoContrato, description: 'Situação do contrato' })
  status: SituacaoContrato;
}

export class CompraResponse extends TransacaoResponse {
  @ApiProperty({ type: ContratoCompraResponse, description: 'Contrato criado' })
  contract: ContratoCompraResponse;

  @ApiProperty({ type: Number, description: 'Caixa do clube após a compra' })
  club_cash: number;
}

export class VendaResponse extends TransacaoResponse {
  @ApiProperty({ type: Number, description: 'Valor pago na compra' })
  purchase_value: number;

  @ApiProperty({ type: Number, description: 'Dias restantes de fidelidade' })
  remaining_days: number;

  @ApiProperty({ type: Number, description: 'Percentual da multa' })
  penalty_rate: number;

  @ApiProperty({ enum: SituacaoContrato, description: 'Situação final do contrato' })
  contract_status: SituacaoContrato;

  @ApiProperty({ type: Number, description: 'Caixa do clube após a venda' })
  club_cash: number;
}

export class ResumoTransacoesResponse {
  @ApiProperty({ type: Number, description: 'Total gasto em compras' })
  total_spent: number;

  @ApiProperty({ type: Number, description: 'Total recebido em vendas' })
  total_received: number;

  @ApiProperty({ type: Number, description: 'Total de taxas e comissões' })
  total_fees: number;

  @ApiProperty({ type: Number, description: 'Total de multas' })
  total_penalties: number;

  @ApiProperty({ type: Number, description: 'Lucro total das vendas' })
  total_profit: number;
}

export class HistoricoTransacoesResponse {
  @ApiProperty({ type: [TransacaoResponse], description: 'Transações filtradas' })
  data: TransacaoResponse[];

  @ApiProperty({ type: ResumoTransacoesResponse, description: 'Resumo filtrado' })
  summary: ResumoTransacoesResponse;
}
