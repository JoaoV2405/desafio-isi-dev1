import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IdPositivoPipe } from '../../../core/validation/id-positivo.pipe.js';
import { ErroResponse } from '../../../core/http/erro.response.js';
import { EscalacaoResponse } from '../dto/escalacao.response.js';
import { SubstituirEscalacaoDto } from '../dto/substituir-escalacao.dto.js';
import { EscalacoesService } from '../services/escalacao.service.js';

@ApiTags('lineups')
@Controller('clubs/:id/lineup')
export class EscalacaoController {
  constructor(private readonly escalacoesService: EscalacoesService) {}

  @Get()
  @ApiOperation({ summary: 'Consulta a escalação atual do clube' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador do clube' })
  @ApiResponse({ status: 200, type: EscalacaoResponse })
  @ApiResponse({ status: 404, type: ErroResponse })
  findByClubId(
    @Param('id', IdPositivoPipe) clubeId: number,
  ): Promise<EscalacaoResponse> {
    return this.escalacoesService.findByClubId(clubeId);
  }

  @Put()
  @ApiOperation({
    summary: 'Substitui a formação e os cinco titulares do clube',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador do clube' })
  @ApiBody({ type: SubstituirEscalacaoDto })
  @ApiResponse({ status: 200, type: EscalacaoResponse })
  @ApiResponse({ status: 400, type: ErroResponse })
  @ApiResponse({ status: 404, type: ErroResponse })
  @ApiResponse({ status: 409, type: ErroResponse })
  replace(
    @Param('id', IdPositivoPipe) clubeId: number,
    @Body() dto: SubstituirEscalacaoDto,
  ): Promise<EscalacaoResponse> {
    return this.escalacoesService.replace(clubeId, dto);
  }
}
