import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ErroResponse } from '../../core/http/erro.response.js';
import { IdPositivoPipe } from '../../core/validation/id-positivo.pipe.js';
import { ListarTransacoesDto } from './dto/listar-transacoes.dto.js';
import { HistoricoTransacoesResponse } from './dto/transacao.response.js';
import { MercadoService } from './services/mercado.service.js';

@ApiTags('transactions')
@Controller('clubs')
export class TransacoesController {
  constructor(private readonly mercadoService: MercadoService) {}

  @Get(':id/transactions/export')
  @ApiOperation({
    summary: 'Exporta o histórico financeiro de um clube em CSV (RN18)',
    description:
      'Snapshots por data e id decrescentes, separados por ponto e vírgula. ' +
      'Datas em Brasília, dinheiro com duas casas e vírgula decimal, lucro nulo vazio. ' +
      'UTF-8 sem BOM e LF inclusive na última linha. Sem resultados, somente cabeçalho e LF.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Id inteiro positivo do clube, sem zeros à esquerda',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description:
      'COMPRA, VENDA ou ambos separados por vírgula, sem espaços ou repetição',
    example: 'COMPRA,VENDA',
  })
  @ApiQuery({
    name: 'player_id',
    required: false,
    type: String,
    description:
      'Id inteiro positivo de jogador existente e não excluído, sem zeros à esquerda',
    schema: { type: 'string', pattern: '^[1-9]\\d*$', maxLength: 10 },
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo CSV do histórico filtrado, sem resumo de totais',
    content: {
      'text/csv': {
        schema: { type: 'string' },
        example:
          'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n' +
          '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70\n',
      },
    },
    headers: {
      'Content-Disposition': {
        description: 'Download com nome baseado no id do clube',
        schema: {
          type: 'string',
          example: 'attachment; filename="historico-clube-1.csv"',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    type: ErroResponse,
    description: 'Filtro inválido; resposta JSON',
  })
  @ApiResponse({
    status: 404,
    type: ErroResponse,
    description:
      'Id de rota inválido, clube ausente ou jogador ausente/excluído; resposta JSON',
  })
  async exportCsv(
    @Param('id', IdPositivoPipe) clubeId: number,
    @Query() filtros: ListarTransacoesDto,
    @Res({ passthrough: true }) response: Pick<Response, 'type' | 'attachment'>,
  ): Promise<string> {
    const csv = await this.mercadoService.exportTransactionsCsv(
      clubeId,
      filtros,
    );
    response.type('text/csv; charset=utf-8');
    response.attachment(`historico-clube-${clubeId}.csv`);
    return csv;
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Consulta o histórico financeiro de um clube' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador do clube' })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'player_id', required: false, type: String })
  @ApiResponse({ status: 200, type: HistoricoTransacoesResponse })
  @ApiResponse({ status: 400, type: ErroResponse })
  @ApiResponse({ status: 404, type: ErroResponse })
  listar(
    @Param('id', IdPositivoPipe) clubeId: number,
    @Query() filtros: ListarTransacoesDto,
  ): Promise<HistoricoTransacoesResponse> {
    return this.mercadoService.listarTransacoes(clubeId, filtros);
  }
}
