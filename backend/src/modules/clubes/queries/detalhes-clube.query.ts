import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Contrato,
  SituacaoContrato,
} from '../../mercado/entities/contrato.entity.js';
import { Clube } from '../entities/clube.entity.js';
import type {
  ContratoAtivoLeitura,
  DetalhesClubeLeitura,
} from './detalhes-clube.types.js';

type ContratoDoElencoRaw = {
  // Preservar o alias padrão: renomear jogador.id impede sua hidratação pelo TypeORM.
  jogador_id: number | null;
} & (
  | {
      contrato_id: number;
      contrato_valor_compra: string;
      contrato_fidelidade_ate: Date;
    }
  | {
      contrato_id: null;
      contrato_valor_compra: null;
      contrato_fidelidade_ate: null;
    }
);

@Injectable()
export class DetalhesClubeQuery {
  constructor(
    @InjectRepository(Clube)
    private readonly clubeRepository: Repository<Clube>,
  ) {}

  async findById(clubeId: number): Promise<DetalhesClubeLeitura | null> {
    // Um único SELECT mantém caixa, jogadores e contratos no mesmo snapshot.
    const { entities, raw } = await this.clubeRepository
      .createQueryBuilder('clube')
      .leftJoinAndSelect(
        'clube.jogadores',
        'jogador',
        'jogador.excluidoEm IS NULL',
      )
      .leftJoin(
        Contrato,
        'contrato',
        `contrato.jogadorId = jogador.id
          AND contrato.clubeId = clube.id
          AND contrato.situacao = :situacao`,
        { situacao: SituacaoContrato.Ativo },
      )
      .addSelect('contrato.id', 'contrato_id')
      .addSelect('contrato.valorCompra', 'contrato_valor_compra')
      .addSelect('contrato.fidelidadeAte', 'contrato_fidelidade_ate')
      .where('clube.id = :clubeId', { clubeId })
      .getRawAndEntities<ContratoDoElencoRaw>();

    const clube = entities[0];

    if (!clube) {
      return null;
    }

    const contratosPorJogador = new Map<number, ContratoAtivoLeitura>();

    for (const linha of raw) {
      if (linha.jogador_id === null || linha.contrato_id === null) {
        continue;
      }

      contratosPorJogador.set(linha.jogador_id, {
        valorCompra: linha.contrato_valor_compra,
        fidelidadeAte: linha.contrato_fidelidade_ate,
      });
    }

    return {
      clube: {
        id: clube.id,
        nome: clube.nome,
        sigla: clube.sigla,
        caixa: clube.caixa,
      },
      elenco: clube.jogadores.map((jogador) => ({
        jogador,
        contrato: contratosPorJogador.get(jogador.id) ?? null,
      })),
    };
  }
}
