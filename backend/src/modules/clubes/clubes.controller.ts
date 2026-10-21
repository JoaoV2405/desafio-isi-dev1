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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { IdPositivoPipe } from '../../core/validation/id-positivo.pipe.js';
import {
  ClubeDetailResponse,
  ClubeResponse,
  ErroClubeResponse,
} from './dto/clube-response.js';
import { CriarClubeDto } from './dto/criar-clube.dto.js';
import { ListarClubesDto } from './dto/listar-clubes.dto.js';
import { ClubesService } from './services/clubes.service.js';

@ApiTags('clubs')
@Controller('clubs')
export class ClubesController {
  constructor(private readonly clubesService: ClubesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um clube' })
  @ApiBody({ type: CriarClubeDto })
  @ApiResponse({ status: 201, type: ClubeResponse })
  @ApiResponse({ status: 400, type: ErroClubeResponse })
  @ApiResponse({ status: 409, type: ErroClubeResponse })
  async create(
    @Body() corpo: CriarClubeDto,
    @Res({ passthrough: true }) response: Pick<Response, 'location'>,
  ): Promise<ClubeResponse> {
    const clube = await this.clubesService.create(corpo);

    response.location(`/api/v1/clubs/${clube.id}`);

    return clube;
  }

  @Get()
  @ApiOperation({ summary: 'Lista os clubes' })
  @ApiResponse({ status: 200, type: [ClubeResponse] })
  @ApiResponse({ status: 400, type: ErroClubeResponse })
  findAll(@Query() query: ListarClubesDto): Promise<ClubeResponse[]> {
    return this.clubesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta um clube pelo identificador' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador do clube' })
  @ApiResponse({ status: 200, type: ClubeDetailResponse })
  @ApiResponse({ status: 404, type: ErroClubeResponse })
  @ApiResponse({
    status: 500,
    type: ErroClubeResponse,
    description: 'Falha interna ou inconsistência dos dados do elenco',
  })
  findById(
    @Param('id', IdPositivoPipe) id: number,
  ): Promise<ClubeDetailResponse> {
    return this.clubesService.findById(id);
  }
}
