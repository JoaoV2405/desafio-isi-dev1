import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IdPositivoPipe } from '../../core/validation/id-positivo.pipe.js';
import { ListarTransacoesDto } from './dto/listar-transacoes.dto.js';
import {
  ErroMercadoResponse,
  HistoricoTransacoesResponse,
} from './dto/transacao.response.js';
import { MercadoService } from './services/mercado.service.js';

@ApiTags('transactions')
@Controller('clubs')
export class TransacoesController {
  constructor(private readonly mercadoService: MercadoService) {}

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Consulta o histórico financeiro de um clube' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador do clube' })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'player_id', required: false, type: String })
  @ApiResponse({ status: 200, type: HistoricoTransacoesResponse })
  @ApiResponse({ status: 400, type: ErroMercadoResponse })
  @ApiResponse({ status: 404, type: ErroMercadoResponse })
  listar(
    @Param('id', IdPositivoPipe) clubeId: number,
    @Query() filtros: ListarTransacoesDto,
  ): Promise<HistoricoTransacoesResponse> {
    return this.mercadoService.listarTransacoes(clubeId, filtros);
  }
}
