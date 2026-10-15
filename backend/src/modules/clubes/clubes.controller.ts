import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import { ClubeResponse, ErroClubeResponse } from './dto/clube-response.js';
import { CriarClubeDto } from './dto/criar-clube.dto.js';
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
    @Res({ passthrough: true }) response: Response,
  ): Promise<ClubeResponse> {
    const clube = await this.clubesService.create(corpo);

    response.location(`/api/v1/clubs/${clube.id}`);

    return clube;
  }

  @Get()
  @ApiOperation({ summary: 'Lista os clubes' })
  @ApiResponse({ status: 200, type: [ClubeResponse] })
  findAll(): Promise<ClubeResponse[]> {
    return this.clubesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta um clube pelo identificador' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador do clube' })
  @ApiResponse({ status: 200, type: ClubeResponse })
  @ApiResponse({ status: 404, type: ErroClubeResponse })
  findById(
    @Param('id', IdPositivoPipe) id: number,
  ): Promise<ClubeResponse> {
    return this.clubesService.findById(id);
  }
}
