import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Clube } from '../../clubes/entities/clube.entity.js';
import { Escalacao } from '../../liga/entities/escalacao.entity.js';
import { AlterarCondicaoJogadorDto } from '../dto/alterar-condicao-jogador.dto.js';
import { CriarJogadorDto } from '../dto/criar-jogador.dto.js';
import { EditarJogadorDto } from '../dto/editar-jogador.dto.js';
import {
  ListaJogadoresResponse,
  type JogadorResponse,
} from '../dto/jogador.response.js';
import {
  type FiltrosJogadores,
  type ListarJogadoresDto,
  type OrdenacaoJogadores,
} from '../dto/listar-jogadores.dto.js';
import {
  CondicaoJogador,
  Jogador,
  PosicaoJogador,
} from '../entities/jogador.entity.js';
import { FiltrosJogadoresMapper } from '../mappers/filtros-jogadores.mapper.js';
import { JogadorMapper } from '../mappers/jogador.mapper.js';
import { JogadorPresenter } from '../presenters/jogador.presenter.js';
import { ValidacaoJogadoresService } from './validacao-jogadores.service.js';

type JogadorCalculado = {
  jogador: Jogador;
  response: JogadorResponse;
  marketValueInCents: number;
  normalizedName: string;
};

const ORDEM_POSICOES: Record<PosicaoJogador, number> = {
  [PosicaoJogador.Goleiro]: 0,
  [PosicaoJogador.Zagueiro]: 1,
  [PosicaoJogador.Lateral]: 2,
  [PosicaoJogador.Meia]: 3,
  [PosicaoJogador.Atacante]: 4,
};

@Injectable()
export class JogadoresService {
  private readonly logger = new Logger(JogadoresService.name);

  constructor(
    @InjectRepository(Jogador)
    private readonly jogadoresRepository: Repository<Jogador>,
    @InjectRepository(Clube)
    private readonly clubesRepository: Repository<Clube>,
    private readonly validacaoJogadoresService: ValidacaoJogadoresService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CriarJogadorDto): Promise<JogadorResponse> {
    this.logger.log('create');
    this.validacaoJogadoresService.validateCreation(dto);
    const baseValueInCents =
      this.validacaoJogadoresService.calculateBaseValueInCents(dto);
    const jogador = JogadorMapper.fromCreation(dto, baseValueInCents);
    const jogadorSalvo = await this.jogadoresRepository.save(jogador);

    return this.presentPlayer(jogadorSalvo);
  }

  async findAll(query: ListarJogadoresDto): Promise<ListaJogadoresResponse> {
    this.logger.log('findAll');
    const filtros = FiltrosJogadoresMapper.fromDto(query);
    this.validacaoJogadoresService.validateFilters(filtros);

    if (
      filtros.clubId !== undefined &&
      !(await this.clubesRepository.existsBy({ id: filtros.clubId }))
    ) {
      throw new NotFoundException('Clube não encontrado');
    }

    const jogadores = await this.jogadoresRepository.find();
    const jogadoresFiltrados = jogadores
      .map((jogador) => this.calculatePlayer(jogador))
      .filter((jogador) => this.matchesFilters(jogador, filtros))
      .sort((a, b) => this.comparePlayers(a, b, filtros.sort));
    const totalItems = jogadoresFiltrados.length;
    const start = (filtros.page - 1) * filtros.limit;
    const data = jogadoresFiltrados
      .slice(start, start + filtros.limit)
      .map(({ response }) => response);

    return {
      data,
      meta: {
        page: filtros.page,
        limit: filtros.limit,
        total_items: totalItems,
        total_pages:
          totalItems === 0 ? 0 : Math.ceil(totalItems / filtros.limit),
      },
    };
  }

  async findById(id: number): Promise<JogadorResponse> {
    this.logger.log('findById');
    return this.presentPlayer(await this.findEntityById(id));
  }

  public calculateMarketValueInCents(jogador: Jogador): number {
    return this.validacaoJogadoresService.calculateMarketValueInCents(jogador);
  }

  async update(id: number, dto: EditarJogadorDto): Promise<JogadorResponse> {
    this.logger.log('update');
    const jogador = await this.findEntityById(id);
    // chaamar save do repository
    this.validacaoJogadoresService.validateUpdate(dto, jogador);
    const jogadorAtualizado = JogadorMapper.applyUpdate(jogador, dto);
    
    return this.presentPlayer(
      await this.jogadoresRepository.save(jogadorAtualizado),
    );
  }

  async updateCondition(
    id: number,
    dto: AlterarCondicaoJogadorDto,
  ): Promise<JogadorResponse> {
    this.logger.log('updateCondition');
    return this.dataSource.transaction(async (manager) => {
      const jogadoresRepository = manager.getRepository(Jogador);
      const jogador = await jogadoresRepository.findOneBy({ id });

      if (!jogador) {
        throw new NotFoundException('Jogador não encontrado');
      }

      if (jogador.condicao === dto.condition) {
        return this.presentPlayer(jogador);
      }

      this.validacaoJogadoresService.validateConditionChange(
        jogador.condicao,
        dto.condition,
      );
      jogador.condicao = dto.condition;

      if (dto.condition === CondicaoJogador.Doente) {
        await manager.delete(Escalacao, { jogadorId: jogador.id });
      }

      return this.presentPlayer(await jogadoresRepository.save(jogador));
    });
  }

  async remove(id: number): Promise<void> {
    this.logger.log('remove');
    const jogador = await this.findEntityById(id);
    this.validacaoJogadoresService.validateRemoval(jogador);

    await this.jogadoresRepository.softRemove(jogador);
  }

  private async findEntityById(id: number): Promise<Jogador> {
    this.logger.log('findEntityById');
    const jogador = await this.jogadoresRepository.findOneBy({ id });

    if (!jogador) {
      throw new NotFoundException('Jogador não encontrado');
    }

    return jogador;
  }

  private presentPlayer(jogador: Jogador): JogadorResponse {
    this.logger.log('presentPlayer');
    return JogadorPresenter.present(jogador, {
      overall: this.validacaoJogadoresService.calculateOverall(jogador),
      marketValueInCents:
        this.validacaoJogadoresService.calculateMarketValueInCents(jogador),
    });
  }

  private calculatePlayer(jogador: Jogador): JogadorCalculado {
    this.logger.log('calculatePlayer');
    const marketValueInCents =
      this.validacaoJogadoresService.calculateMarketValueInCents(jogador);

    return {
      jogador,
      marketValueInCents,
      normalizedName: normalizeForComparison(jogador.nome),
      response: JogadorPresenter.present(jogador, {
        overall: this.validacaoJogadoresService.calculateOverall(jogador),
        marketValueInCents,
      }),
    };
  }

  /// criar modulo partidas e transferir essas funções

  private matchesFilters(
    calculado: JogadorCalculado,
    filtros: FiltrosJogadores,
  ): boolean {
    this.logger.log('matchesFilters');
    const { jogador, marketValueInCents, normalizedName } = calculado;

    if (
      filtros.search &&
      !normalizedName.includes(normalizeForComparison(filtros.search))
    ) {
      return false;
    }

    if (filtros.position && jogador.posicao !== filtros.position) return false;
    if (filtros.condition && jogador.condicao !== filtros.condition)
      return false;
    if (filtros.free === true && jogador.clubeId !== null) return false;
    if (filtros.free === false && jogador.clubeId === null) return false;
    if (filtros.clubId !== undefined && jogador.clubeId !== filtros.clubId) {
      return false;
    }

    return (
      jogador.idade >= filtros.minAge &&
      jogador.idade <= filtros.maxAge &&
      marketValueInCents >= filtros.minValueInCents &&
      marketValueInCents <= filtros.maxValueInCents
    );
  }

  private comparePlayers(
    a: JogadorCalculado,
    b: JogadorCalculado,
    ordenacoes: readonly OrdenacaoJogadores[],
  ): number {
    this.logger.log('comparePlayers');
    for (const ordenacao of ordenacoes) {
      const resultado = this.compareBySort(a, b, ordenacao);
      if (resultado !== 0) return resultado;
    }
    return (
      compareText(a.normalizedName, b.normalizedName) ||
      a.jogador.id - b.jogador.id
    );
  }

  private compareBySort(
    a: JogadorCalculado,
    b: JogadorCalculado,
    ordenacao: OrdenacaoJogadores,
  ): number {
    this.logger.log('compareBySort');
    switch (ordenacao) {
      case 'name':
        return compareText(a.normalizedName, b.normalizedName);
      case 'value_asc':
        return a.marketValueInCents - b.marketValueInCents;
      case 'value_desc':
        return b.marketValueInCents - a.marketValueInCents;
      case 'age_asc':
        return a.jogador.idade - b.jogador.idade;
      case 'age_desc':
        return b.jogador.idade - a.jogador.idade;
      case 'position':
        return (
          ORDEM_POSICOES[a.jogador.posicao] - ORDEM_POSICOES[b.jogador.posicao]
        );
    }
  }
}

function normalizeForComparison(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '');
}

function compareText(a: string, b: string): number {
  const caracteresA = Array.from(a);
  const caracteresB = Array.from(b);
  const tamanhoComparavel = Math.min(caracteresA.length, caracteresB.length);
  for (let indice = 0; indice < tamanhoComparavel; indice += 1) {
    const codigoA = caracteresA[indice].codePointAt(0) ?? 0;
    const codigoB = caracteresB[indice].codePointAt(0) ?? 0;
    if (codigoA !== codigoB) return codigoA - codigoB;
  }
  return caracteresA.length - caracteresB.length;
}
