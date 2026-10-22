import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClassificacaoResponse } from '../dto/classificacao.response.js';
import { ClassificacaoPresenter } from '../presenters/classificacao.presenter.js';
import { ClassificacaoService } from '../services/classificacao.service.js';

@ApiTags('standings')
@Controller('standings')
export class ClassificacaoController {
  constructor(private readonly classificacaoService: ClassificacaoService) {}

  @Get()
  @ApiOperation({
    summary:
      'Consulta a classificação de todos os clubes, inclusive os sem jogos',
    description:
      'Calculada a cada consulta. Ordenação: pontos, saldo de gols e gols marcados decrescentes; nome normalizado e id crescentes. Posições sequenciais sem repetição.',
  })
  @ApiResponse({ status: 200, type: [ClassificacaoResponse] })
  async findAll(): Promise<ClassificacaoResponse[]> {
    return (await this.classificacaoService.findAll()).map((clube) =>
      ClassificacaoPresenter.present(clube),
    );
  }
}
