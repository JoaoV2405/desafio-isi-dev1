import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResumoInicioResponse } from './dto/resumo-inicio.response.js';
import { InicioService } from './inicio.service.js';

@ApiTags('dashboard')
@Controller('dashboard')
export class InicioController {
  constructor(private readonly inicioService: InicioService) {}

  @Get()
  @ApiOperation({ summary: 'Consulta os totais e o líder para a tela inicial' })
  @ApiResponse({ status: 200, type: ResumoInicioResponse })
  getSummary(): Promise<ResumoInicioResponse> {
    return this.inicioService.getSummary();
  }
}
