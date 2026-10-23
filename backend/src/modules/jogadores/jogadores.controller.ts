import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ErroResponse } from '../../core/http/erro.response.js';
import { IdPositivoPipe } from '../../core/validation/id-positivo.pipe.js';
import { AlterarCondicaoJogadorDto } from './dto/alterar-condicao-jogador.dto.js';
import { CriarJogadorDto } from './dto/criar-jogador.dto.js';
import { EditarJogadorDto } from './dto/editar-jogador.dto.js';
import {
  ListaJogadoresResponse,
  JogadorResponse,
} from './dto/jogador.response.js';
import { ListarJogadoresDto } from './dto/listar-jogadores.dto.js';
import { JogadoresService } from './services/jogadores.service.js';

@ApiTags('players')
@Controller('players')
export class JogadoresController {
  constructor(private readonly jogadoresService: JogadoresService) {}

  @Get()
  @ApiOperation({ summary: 'Lista jogadores com filtros e paginação' })
  @ApiResponse({ status: 200, type: ListaJogadoresResponse })
  @ApiResponse({ status: 400, type: ErroResponse })
  @ApiResponse({ status: 404, type: ErroResponse })
  findAll(@Query() query: ListarJogadoresDto): Promise<ListaJogadoresResponse> {
    return this.jogadoresService.findAll(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: JogadorResponse })
  @ApiResponse({ status: 404, type: ErroResponse })
  findById(@Param('id', IdPositivoPipe) id: number): Promise<JogadorResponse> {
    return this.jogadoresService.findById(id);
  }

  @Post()
  @ApiBody({ type: CriarJogadorDto })
  @ApiResponse({ status: 201, type: JogadorResponse })
  @ApiResponse({ status: 400, type: ErroResponse })
  async create(
    @Body() corpo: CriarJogadorDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<JogadorResponse> {
    const jogador = await this.jogadoresService.create(corpo);

    response.location(`/api/v1/players/${jogador.id}`);

    return jogador;
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: EditarJogadorDto })
  @ApiResponse({ status: 200, type: JogadorResponse })
  @ApiResponse({ status: 400, type: ErroResponse })
  @ApiResponse({ status: 404, type: ErroResponse })
  @ApiResponse({ status: 409, type: ErroResponse })
  update(
    @Param('id', IdPositivoPipe) id: number,
    @Body() corpo: EditarJogadorDto,
  ): Promise<JogadorResponse> {
    return this.jogadoresService.update(id, corpo);
  }

  @Patch(':id/condition')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: AlterarCondicaoJogadorDto })
  @ApiResponse({ status: 200, type: JogadorResponse })
  @ApiResponse({ status: 400, type: ErroResponse })
  @ApiResponse({ status: 404, type: ErroResponse })
  @ApiResponse({ status: 409, type: ErroResponse })
  updateCondition(
    @Param('id', IdPositivoPipe) id: number,
    @Body() corpo: AlterarCondicaoJogadorDto,
  ): Promise<JogadorResponse> {
    return this.jogadoresService.updateCondition(id, corpo);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, type: ErroResponse })
  @ApiResponse({ status: 409, type: ErroResponse })
  remove(@Param('id', IdPositivoPipe) id: number): Promise<void> {
    return this.jogadoresService.remove(id);
  }
}
