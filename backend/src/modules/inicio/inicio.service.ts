import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Clube } from '../clubes/entities/clube.entity.js';
import { Jogador } from '../jogadores/entities/jogador.entity.js';
import { Partida } from '../liga/entities/partida.entity.js';
import { ClassificacaoService } from '../liga/services/classificacao.service.js';
import type { ResumoInicioResponse } from './dto/resumo-inicio.response.js';

type TotaisInicioRaw = {
  total_players: string;
  total_free_players: string;
  total_clubs: string;
  total_matches: string;
};

@Injectable()
export class InicioService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly classificacaoService: ClassificacaoService,
  ) {}

  async getSummary(): Promise<ResumoInicioResponse> {
    const [totais, classificacao] = await Promise.all([
      this.dataSource
        .getRepository(Jogador)
        .createQueryBuilder('jogador')
        .select('COUNT(*)', 'total_players')
        .addSelect(
          'COUNT(*) FILTER (WHERE jogador.clubeId IS NULL)',
          'total_free_players',
        )
        .addSelect(
          (query) => query.select('COUNT(*)').from(Clube, 'clube'),
          'total_clubs',
        )
        .addSelect(
          (query) => query.select('COUNT(*)').from(Partida, 'partida'),
          'total_matches',
        )
        .getRawOne<TotaisInicioRaw>(),
      this.classificacaoService.findAll(),
    ]);

    if (!totais)
      throw new Error('Não foi possível consultar os totais da tela inicial');

    return {
      total_players: Number(totais.total_players),
      total_free_players: Number(totais.total_free_players),
      total_clubs: Number(totais.total_clubs),
      total_matches: Number(totais.total_matches),
      leader: classificacao[0]?.nomeClube ?? null,
    };
  }
}
