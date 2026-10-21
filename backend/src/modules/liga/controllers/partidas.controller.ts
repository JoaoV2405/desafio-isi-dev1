import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { IdPositivoPipe } from '../../../core/validation/id-positivo.pipe.js';
import { ErroResponse } from '../../jogadores/dto/jogador.response.js';
import { CriarPartidaDto } from '../dto/criar-partida.dto.js';
import { ListarPartidasDto } from '../dto/listar-partidas.dto.js';
import {
  PartidaDetalheResponse,
  PartidaResumoResponse,
} from '../dto/partida.response.js';
import { PartidaPresenter } from '../presenters/partida.presenter.js';
import { PartidasService } from '../services/partidas.service.js';

@ApiTags('matches')
@Controller('matches')
export class PartidasController {
  constructor(private readonly partidasService: PartidasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Joga e registra uma partida entre dois clubes com escalação completa',
  })
  @ApiBody({ type: CriarPartidaDto })
  @ApiResponse({
    status: 201,
    type: PartidaDetalheResponse,
    headers: {
      Location: {
        description: 'Caminho da partida criada, com prefixo /api/v1',
        schema: { type: 'string', example: '/api/v1/matches/1' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    type: ErroResponse,
    description: 'Corpo ou ids inválidos, ou clubes iguais',
  })
  @ApiResponse({
    status: 404,
    type: ErroResponse,
    description: 'Clube inexistente',
  })
  @ApiResponse({
    status: 409,
    type: ErroResponse,
    description: 'Escalação incompleta ou disputa concorrente persistente',
  })
  async create(
    @Body() body: CriarPartidaDto,
    @Res({ passthrough: true }) response: Pick<Response, 'location'>,
  ): Promise<PartidaDetalheResponse> {
    const partida = await this.partidasService.create({
      mandanteId: body.home_club_id,
      visitanteId: body.away_club_id,
    });
    response.location(`/api/v1/matches/${partida.id}`);
    return PartidaPresenter.presentDetail(partida);
  }

  @Get()
  @ApiOperation({
    summary:
      'Consulta o histórico, do mais recente para o mais antigo, sem duelos',
  })
  @ApiQuery({
    name: 'club_id',
    required: false,
    type: String,
    description:
      'Clube mandante ou visitante; inteiro positivo sem zeros à esquerda',
    schema: { type: 'string', pattern: '^[1-9]\\d*$' },
  })
  @ApiResponse({ status: 200, type: [PartidaResumoResponse] })
  @ApiResponse({
    status: 400,
    type: ErroResponse,
    description: 'Filtro inválido',
  })
  @ApiResponse({
    status: 404,
    type: ErroResponse,
    description: 'Clube filtrado inexistente',
  })
  async findAll(
    @Query() query: ListarPartidasDto,
  ): Promise<PartidaResumoResponse[]> {
    const clubeId =
      query.club_id === undefined ? undefined : Number(query.club_id);
    return (await this.partidasService.findAll(clubeId)).map((partida) =>
      PartidaPresenter.presentSummary(partida),
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consulta uma partida com os seis duelos históricos ordenados',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description:
      'Identificador inteiro positivo da partida, sem zeros à esquerda',
  })
  @ApiResponse({ status: 200, type: PartidaDetalheResponse })
  @ApiResponse({
    status: 404,
    type: ErroResponse,
    description: 'Id inválido ou partida inexistente',
  })
  async findById(
    @Param('id', IdPositivoPipe) id: number,
  ): Promise<PartidaDetalheResponse> {
    return PartidaPresenter.presentDetail(
      await this.partidasService.findById(id),
    );
  }
}
