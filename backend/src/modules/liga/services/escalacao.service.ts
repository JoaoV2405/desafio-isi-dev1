import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Clube } from '../../clubes/entities/clube.entity.js';
import {
  CondicaoJogador,
  Jogador,
} from '../../jogadores/entities/jogador.entity.js';
import { JogadoresService } from '../../jogadores/services/jogadores.service.js';
import { EscalacaoResponse } from '../dto/escalacao.response.js';
import { SubstituirEscalacaoDto } from '../dto/substituir-escalacao.dto.js';
import { Escalacao } from '../entities/escalacao.entity.js';
import {
  isComposicaoEscalacaoValida,
  isEscalacaoCompleta,
} from '../validators/escalacao.validator.js';

@Injectable()
export class EscalacoesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jogadoresService: JogadoresService,
  ) {}

  async findByClubId(clubeId: number): Promise<EscalacaoResponse> {
    // Uma única consulta mantém formação e titulares no mesmo retrato do banco.
    const clube = await this.dataSource
      .getRepository(Clube)
      .createQueryBuilder('clube')
      .leftJoin(Escalacao, 'escalacao', 'escalacao.clube_id = clube.id')
      .leftJoinAndSelect(
        'clube.jogadores',
        'jogador',
        'jogador.id = escalacao.jogador_id',
      )
      .where('clube.id = :clubeId', { clubeId })
      .getOne();

    if (!clube) {
      throw new NotFoundException('Clube não encontrado');
    }

    return this.present(clube, clube.jogadores);
  }

  async replace(
    clubeId: number,
    dto: SubstituirEscalacaoDto,
  ): Promise<EscalacaoResponse> {
    const { formation: formacao, player_ids: jogadoresIds } = dto;

    if (jogadoresIds.some((id) => id > 2_147_483_647)) {
      throw new NotFoundException('Um ou mais jogadores não foram encontrados');
    }

    return this.dataSource.transaction(async (manager) => {
      // Bloqueia jogadores por id antes do clube, na mesma ordem usada pela venda.
      // Assim, venda ou doença não podem invalidar os titulares entre validação e gravação.
      const jogadoresRepository = manager.getRepository(Jogador);
      const jogadores = await jogadoresRepository
        .createQueryBuilder('jogador')
        .setLock('pessimistic_write')
        .where('jogador.id IN (:...jogadoresIds)', { jogadoresIds })
        .andWhere('jogador.excluido_em IS NULL')
        .orderBy('jogador.id', 'ASC')
        .getMany();
      const jogadoresEncontrados = new Set(
        jogadores.map((jogador) => jogador.id),
      );
      const idsAusentes = jogadoresIds.filter(
        (id) => !jogadoresEncontrados.has(id),
      );
      if (idsAusentes.length > 0) {
        throw new NotFoundException(
          'Um ou mais jogadores não foram encontrados',
        );
      }

      const clubesRepository = manager.getRepository(Clube);
      const clube = await clubesRepository
        .createQueryBuilder('clube')
        .setLock('pessimistic_write')
        .where('clube.id = :clubeId', { clubeId })
        .getOne();
      if (!clube) {
        throw new NotFoundException('Clube não encontrado');
      }

      const jogadorDeOutroClube = jogadores.find(
        (jogador) => jogador.clubeId !== clube.id,
      );
      if (jogadorDeOutroClube) {
        throw new ConflictException(
          'Todos os jogadores devem pertencer ao clube',
        );
      }

      const jogadorDoente = jogadores.find(
        (jogador) => jogador.condicao === CondicaoJogador.Doente,
      );
      if (jogadorDoente) {
        throw new ConflictException('Jogador doente não pode ser escalado');
      }

      if (!isComposicaoEscalacaoValida(formacao, jogadores)) {
        throw new ConflictException(
          'Os jogadores não correspondem à formação escolhida',
        );
      }

      const escalacoesRepository = manager.getRepository(Escalacao);
      await escalacoesRepository.delete({ clubeId: clube.id });
      clube.formacao = formacao;
      await clubesRepository.save(clube);
      const novasEscalacoes = jogadores.map((jogador) =>
        escalacoesRepository.create({
          clubeId: clube.id,
          jogadorId: jogador.id,
        }),
      );
      await escalacoesRepository.save(novasEscalacoes);

      return this.present(clube, jogadores);
    });
  }

  private present(
    clube: Clube,
    jogadores: readonly Jogador[],
  ): EscalacaoResponse {
    return {
      club_id: clube.id,
      formation: clube.formacao,
      complete: isEscalacaoCompleta(clube, jogadores),
      players: this.jogadoresService.presentRoster(jogadores),
    };
  }
}
