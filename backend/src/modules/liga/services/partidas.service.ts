import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, In, type SelectQueryBuilder } from 'typeorm';
import { isSerializationFailure } from '../../../core/validation/is-serialization-failure.js';
import { Clube } from '../../clubes/entities/clube.entity.js';
import type { Jogador } from '../../jogadores/entities/jogador.entity.js';
import { JogadoresService } from '../../jogadores/services/jogadores.service.js';
import { DueloPartida } from '../entities/duelo-partida.entity.js';
import { Escalacao } from '../entities/escalacao.entity.js';
import { Partida } from '../entities/partida.entity.js';
import type {
  DetalhePartida,
  ResumoPartida,
} from '../types/historico-partida.types.js';
import type {
  CriarPartidaInput,
  EscalacaoPartida,
} from '../types/partida.types.js';
import {
  isEscalacaoCompleta,
  isFormacaoClube,
} from '../validators/escalacao.validator.js';
import {
  calculateDuels,
  calculateResult,
  calculateScore,
} from './calculos-partida.js';

const ID_MAXIMO = 2_147_483_647;

@Injectable()
export class PartidasService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jogadoresService: JogadoresService,
  ) {}

  async create(input: CriarPartidaInput): Promise<Partida> {
    const { mandanteId, visitanteId } = input;
    const clubesIds = [mandanteId, visitanteId];
    if (
      clubesIds.some((id) => !Number.isSafeInteger(id) || id <= 0) ||
      mandanteId === visitanteId
    ) {
      throw new BadRequestException(
        'Informe dois clubes distintos com ids inteiros positivos',
      );
    }
    if (clubesIds.some((id) => id > ID_MAXIMO)) {
      throw new NotFoundException('Clube não encontrado');
    }

    // FKs também validam a versão das linhas referenciadas; 40001 exige reler tudo, não só repetir o INSERT.
    for (let tentativa = 1; ; tentativa += 1) {
      try {
        return await this.createInTransaction(input);
      } catch (error) {
        if (!isSerializationFailure(error)) throw error;
        if (tentativa === 3) {
          throw new ConflictException(
            'As escalações mudaram durante a partida. Tente novamente.',
            { cause: error },
          );
        }
      }
    }
  }

  async findAll(clubeId?: number): Promise<ResumoPartida[]> {
    if (clubeId !== undefined) {
      if (
        !Number.isSafeInteger(clubeId) ||
        clubeId < 1 ||
        clubeId > ID_MAXIMO
      ) {
        throw new BadRequestException(
          'O filtro de clube deve ser um id inteiro positivo válido',
        );
      }
      if (
        !(await this.dataSource.getRepository(Clube).existsBy({ id: clubeId }))
      ) {
        throw new NotFoundException('Clube não encontrado');
      }
    }

    const query = this.createHistoryQuery()
      .orderBy('partida.jogadaEm', 'DESC')
      .addOrderBy('partida.id', 'DESC');
    if (clubeId !== undefined) {
      query.where(
        '(partida.mandanteId = :clubeId OR partida.visitanteId = :clubeId)',
        { clubeId },
      );
    }
    const partidas = await query.getMany();
    return partidas.map((partida) => this.summarize(partida));
  }

  async findById(id: number): Promise<DetalhePartida> {
    if (!Number.isSafeInteger(id) || id < 1 || id > ID_MAXIMO) {
      throw new NotFoundException('Partida não encontrada');
    }

    // Os participantes vêm dos snapshots; venda e exclusão lógica não podem ocultar o histórico.
    const partida = await this.createHistoryQuery()
      .leftJoinAndSelect('partida.duelos', 'duelo')
      .where('partida.id = :id', { id })
      .orderBy('duelo.ordem', 'ASC')
      .getOne();
    if (!partida) {
      throw new NotFoundException('Partida não encontrada');
    }
    return { ...this.summarize(partida), duelos: partida.duelos };
  }

  private createHistoryQuery(): SelectQueryBuilder<Partida> {
    return this.dataSource
      .getRepository(Partida)
      .createQueryBuilder('partida')
      .innerJoin('partida.mandante', 'mandante')
      .innerJoin('partida.visitante', 'visitante')
      .addSelect([
        'mandante.id',
        'mandante.nome',
        'visitante.id',
        'visitante.nome',
      ]);
  }

  private summarize(partida: Partida): ResumoPartida {
    return {
      id: partida.id,
      jogadaEm: partida.jogadaEm,
      mandanteId: partida.mandanteId,
      visitanteId: partida.visitanteId,
      golsMandante: partida.golsMandante,
      golsVisitante: partida.golsVisitante,
      formacaoMandante: partida.formacaoMandante,
      formacaoVisitante: partida.formacaoVisitante,
      mandante: { id: partida.mandante.id, nome: partida.mandante.nome },
      visitante: { id: partida.visitante.id, nome: partida.visitante.nome },
      resultado: calculateResult(partida.golsMandante, partida.golsVisitante),
    };
  }

  private async createInTransaction({
    mandanteId,
    visitanteId,
  }: CriarPartidaInput): Promise<Partida> {
    const clubesIds = [mandanteId, visitanteId];
    // Todas as leituras enxergam o mesmo retrato, mesmo se outro fluxo vender ou alterar um titular.
    return this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      const clubes = await manager
        .getRepository(Clube)
        .findBy({ id: In(clubesIds) });
      const mandante = clubes.find((clube) => clube.id === mandanteId);
      const visitante = clubes.find((clube) => clube.id === visitanteId);
      if (!mandante || !visitante) {
        throw new NotFoundException('Clube não encontrado');
      }

      const escalacoes = await manager
        .getRepository(Escalacao)
        .createQueryBuilder('escalacao')
        .innerJoinAndSelect('escalacao.jogador', 'jogador')
        .where('escalacao.clube_id IN (:...clubesIds)', { clubesIds })
        .getMany();
      const titulares = (clubeId: number): Jogador[] =>
        escalacoes
          .filter((escalacao) => escalacao.clubeId === clubeId)
          .map((escalacao) => escalacao.jogador);
      const casa = this.prepareLineup(mandante, titulares(mandanteId));
      const fora = this.prepareLineup(visitante, titulares(visitanteId));
      const duelos = calculateDuels(casa, fora);
      if (
        duelos.length !== 6 ||
        !duelos.every(
          (duelo, indice) =>
            duelo.ordem === indice + 1 &&
            duelo.clubeAtacanteId === (indice < 3 ? mandanteId : visitanteId),
        )
      ) {
        throw new Error('Conjunto inválido de duelos calculados');
      }
      const placar = calculateScore(duelos);

      const partidasRepository = manager.getRepository(Partida);
      const duelosRepository = manager.getRepository(DueloPartida);
      const partida = await partidasRepository.save(
        partidasRepository.create({
          mandanteId,
          visitanteId,
          golsMandante: placar.golsMandante,
          golsVisitante: placar.golsVisitante,
          formacaoMandante: casa.formacao,
          formacaoVisitante: fora.formacao,
        }),
      );

      // As duas gravações pertencem ao mesmo commit: falhar em qualquer duelo desfaz a partida.
      partida.duelos = await duelosRepository.save(
        duelos.map((duelo) =>
          duelosRepository.create({
            ...duelo,
            partidaId: partida.id,
          }),
        ),
      );
      partida.mandante = mandante;
      partida.visitante = visitante;
      return partida;
    });
  }

  private prepareLineup(
    clube: Clube,
    jogadores: readonly Jogador[],
  ): EscalacaoPartida {
    if (
      !isEscalacaoCompleta(clube, jogadores) ||
      !isFormacaoClube(clube.formacao)
    ) {
      throw new ConflictException(
        'Os dois clubes precisam de escalações completas',
      );
    }
    const [goleiro, primeiro, segundo, terceiro, quarto] =
      this.jogadoresService.sortRoster(jogadores);
    return {
      clubeId: clube.id,
      formacao: clube.formacao,
      titulares: [goleiro, primeiro, segundo, terceiro, quarto],
    };
  }
}
