import { Injectable } from '@nestjs/common';
import type { LinhaClassificacao } from '../types/classificacao.types.js';
import { projectStandings } from './calculos-classificacao.js';
import { ClassificacaoQuery } from './classificacao.query.js';

@Injectable()
export class ClassificacaoService {
  constructor(private readonly classificacaoQuery: ClassificacaoQuery) {}

  async findAll(): Promise<LinhaClassificacao[]> {
    return projectStandings(await this.classificacaoQuery.getStandings());
  }
}
