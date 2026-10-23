import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  compareText,
  normalizeForComparison,
} from '../../../core/text/ordenacao-texto.js';
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
import { CondicaoJogador, Jogador } from '../entities/jogador.entity.js';
import { FiltrosJogadoresMapper } from '../mappers/filtros-jogadores.mapper.js';
import { JogadorMapper } from '../mappers/jogador.mapper.js';
import { JogadorPresenter } from '../presenters/jogador.presenter.js';
import {
  compareNameAndId,
  comparePositions,
  sortRoster,
} from './ordenacao-jogadores.js';
import { projectRoster } from './project-roster.js';
import { ValidacaoJogadoresService } from './validacao-jogadores.service.js';

type JogadorCalculado = {
  jogador: Jogador;
  response: JogadorResponse;
  marketValueInCents: number;
  normalizedName: string;
};

@Injectable()
export class JogadoresService {
  constructor(
    @InjectRepository(Jogador)
    private readonly jogadoresRepository: Repository<Jogador>,
    @InjectRepository(Clube)
    private readonly clubesRepository: Repository<Clube>,
    private readonly validacaoJogadoresService: ValidacaoJogadoresService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CriarJogadorDto): Promise<JogadorResponse> {
    // Valida regras que dependem de mais de um campo e calcula o valor base, que fica fixo após o cadastro.
    this.validacaoJogadoresService.validateCreation(dto);
    const baseValueInCents =
      this.validacaoJogadoresService.calculateBaseValueInCents(dto);
    const jogador = JogadorMapper.fromCreation(dto, baseValueInCents);
    const jogadorSalvo = await this.jogadoresRepository.save(jogador);

    return this.presentPlayer(jogadorSalvo);
  }

  async findAll(query: ListarJogadoresDto): Promise<ListaJogadoresResponse> {
    const filtros = FiltrosJogadoresMapper.fromDto(query);
    this.validacaoJogadoresService.validateFilters(filtros);

    if (
      filtros.clubId !== undefined &&
      !(await this.clubesRepository.existsBy({ id: filtros.clubId }))
    ) {
      throw new NotFoundException('Clube não encontrado');
    }

    // O valor de mercado é derivado do estado atual, então filtros e ordenação são aplicados após calcular cada jogador.
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
    return this.presentPlayer(await this.findEntityById(id));
  }

  public calculateMarketValueInCents(jogador: Jogador): number {
    return this.validacaoJogadoresService.calculateMarketValueInCents(jogador);
  }

  sortRoster(jogadores: readonly Jogador[]): Jogador[] {
    return sortRoster(jogadores);
  }

  presentRoster(jogadores: readonly Jogador[]): JogadorResponse[] {
    return projectRoster(jogadores).players;
  }

  async update(id: number, dto: EditarJogadorDto): Promise<JogadorResponse> {
    const jogador = await this.findEntityById(id);
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
    // A condição e a eventual saída da escalação precisam confirmar ou reverter juntas.
    return this.dataSource.transaction(async (manager) => {
      const jogadoresRepository = manager.getRepository(Jogador);
      const jogador = await jogadoresRepository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!jogador) {
        throw new NotFoundException('Jogador não encontrado');
      }

      if (jogador.condicao === dto.condition) {
        // Repetir a condição é idempotente e não precisa gerar escrita nem remover novamente a escalação.
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
    const jogador = await this.findEntityById(id);
    this.validacaoJogadoresService.validateRemoval(jogador);

    await this.jogadoresRepository.softRemove(jogador);
  }

  private async findEntityById(id: number): Promise<Jogador> {
    const jogador = await this.jogadoresRepository.findOneBy({ id });

    if (!jogador) {
      throw new NotFoundException('Jogador não encontrado');
    }

    return jogador;
  }

  private presentPlayer(jogador: Jogador): JogadorResponse {
    return JogadorPresenter.present(jogador, {
      overall: this.validacaoJogadoresService.calculateOverall(jogador),
      marketValueInCents:
        this.validacaoJogadoresService.calculateMarketValueInCents(jogador),
    });
  }

  private calculatePlayer(jogador: Jogador): JogadorCalculado {
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

  private matchesFilters(
    calculado: JogadorCalculado,
    filtros: FiltrosJogadores,
  ): boolean {
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
    for (const ordenacao of ordenacoes) {
      const resultado = this.compareBySort(a, b, ordenacao);
      if (resultado !== 0) return resultado;
    }
    return compareNameAndId(a, b);
  }

  private compareBySort(
    a: JogadorCalculado,
    b: JogadorCalculado,
    ordenacao: OrdenacaoJogadores,
  ): number {
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
        return comparePositions(a.jogador, b.jogador);
    }
  }
}
