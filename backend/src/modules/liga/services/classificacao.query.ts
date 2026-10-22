import { Injectable } from '@nestjs/common';

import { DataSource } from 'typeorm';
import type { EstatisticasClube } from '../types/classificacao.types.js';

type EstatisticasRaw = {
  [Field in keyof EstatisticasClube]: EstatisticasClube[Field] extends number
    ? number | string
    : EstatisticasClube[Field];
};

function parseCount(value: number | string): number {
  const count =
    typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0) {
    throw new Error('Estatística de classificação fora do intervalo suportado');
  }
  return count;
}

@Injectable()
export class ClassificacaoQuery {
  constructor(private readonly dataSource: DataSource) {}

  async getStandings(): Promise<EstatisticasClube[]> {
    const mandantes = this.dataSource
      .createQueryBuilder()
      .select('p.mandante_id', 'clube_id')
      .addSelect('p.gols_mandante', 'gols_pro')
      .addSelect('p.gols_visitante', 'gols_contra')
      .from('partidas', 'p');

    const visitantes = this.dataSource
      .createQueryBuilder()
      .select('p.visitante_id', 'clube_id')
      .addSelect('p.gols_visitante', 'gols_pro')
      .addSelect('p.gols_mandante', 'gols_contra')
      .from('partidas', 'p');

    const participacoes = `
        ${mandantes.getQuery()}
        UNION ALL
        ${visitantes.getQuery()}
        `;

    const totais = this.dataSource
      .createQueryBuilder()
      .select('p.clube_id', 'clube_id')
      .addSelect('COUNT(*)', 'jogos')
      .addSelect(
        'COUNT(*) FILTER (WHERE p.gols_pro > p.gols_contra)',
        'vitorias',
      )
      .addSelect(
        'COUNT(*) FILTER (WHERE p.gols_pro = p.gols_contra)',
        'empates',
      )
      .addSelect(
        'COUNT(*) FILTER (WHERE p.gols_pro < p.gols_contra)',
        'derrotas',
      )
      .addSelect('SUM(p.gols_pro)', 'gols_marcados')
      .addSelect('SUM(p.gols_contra)', 'gols_sofridos')
      .from('participacoes', 'p')
      .groupBy('p.clube_id');

    // Uma instrução mantém clubes e participações no mesmo snapshot.
    const rows = await this.dataSource
      .createQueryBuilder()
      .addCommonTableExpression(participacoes, 'participacoes')
      .addCommonTableExpression(totais, 'totais')
      .select('clube.id', 'clubeId')
      .addSelect('clube.nome', 'nomeClube')
      .addSelect('COALESCE(t.jogos, 0)', 'jogos')
      .addSelect('COALESCE(t.vitorias, 0)', 'vitorias')
      .addSelect('COALESCE(t.empates, 0)', 'empates')
      .addSelect('COALESCE(t.derrotas, 0)', 'derrotas')
      .addSelect('COALESCE(t.gols_marcados, 0)', 'golsMarcados')
      .addSelect('COALESCE(t.gols_sofridos, 0)', 'golsSofridos')
      .from('clubes', 'clube')
      .leftJoin('totais', 't', 't.clube_id = clube.id')
      .getRawMany<EstatisticasRaw>();

    return rows.map((row) => ({
      clubeId: parseCount(row.clubeId),
      nomeClube: row.nomeClube,
      jogos: parseCount(row.jogos),
      vitorias: parseCount(row.vitorias),
      empates: parseCount(row.empates),
      derrotas: parseCount(row.derrotas),
      golsMarcados: parseCount(row.golsMarcados),
      golsSofridos: parseCount(row.golsSofridos),
    }));
  }
}
