import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IdPositivoPipe } from '../../core/validation/id-positivo.pipe.js';
import { ComprarJogadorDto } from './dto/comprar-jogador.dto.js';
import {
  CompraResponse,
  ErroMercadoResponse,
  VendaResponse,
} from './dto/transacao.response.js';
import { MercadoService } from './services/mercado.service.js';

@ApiTags('market')
@Controller('players')
export class MercadoController {
  constructor(private readonly mercadoService: MercadoService) {}

  @Post(':id/buy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Compra um jogador livre para um clube' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador do jogador' })
  @ApiBody({ type: ComprarJogadorDto })
  @ApiResponse({ status: 200, type: CompraResponse })
  @ApiResponse({ status: 400, type: ErroMercadoResponse })
  @ApiResponse({ status: 404, type: ErroMercadoResponse })
  @ApiResponse({ status: 409, type: ErroMercadoResponse })
  comprar(
    @Param('id', IdPositivoPipe) jogadorId: number,
    @Body() corpo: ComprarJogadorDto,
  ): Promise<CompraResponse> {
    return this.mercadoService.comprar(jogadorId, corpo);
  }

  @Post(':id/sell')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vende um jogador pelo clube atual' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador do jogador' })
  @ApiResponse({ status: 200, type: VendaResponse })
  @ApiResponse({ status: 404, type: ErroMercadoResponse })
  @ApiResponse({ status: 409, type: ErroMercadoResponse })
  vender(@Param('id', IdPositivoPipe) jogadorId: number): Promise<VendaResponse> {
    return this.mercadoService.vender(jogadorId);
  }
}
