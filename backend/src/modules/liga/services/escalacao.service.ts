import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Clube, FormacaoClube } from '../../clubes/entities/clube.entity.js';
import {
  CondicaoJogador,
  Jogador,
} from '../../jogadores/entities/jogador.entity.js';
import { Escalacao } from '../entities/escalacao.entity.js';
import {
  isComposicaoEscalacaoValida,
  isFormacaoClube,
} from './formacao-validation.service.js';

@Injectable()
export class EscalacoesService {
  constructor(private readonly dataSource: DataSource) {}

  async substituirEscalacao(
    clubeId: number,
    formacao: FormacaoClube,
    jogadoresIds: number[],
  ): Promise<void> {
    if (!isFormacaoClube(formacao)) {
      throw new BadRequestException('Formação inválida');
    }

    await this.dataSource.transaction(async (manager) => {
      // Carrega os jogadores em lote sob lock e detecta IDs inexistentes ou excluídos.
      const jogadoresRepository = manager.getRepository(Jogador);
      const jogadores = await jogadoresRepository
        .createQueryBuilder('jogador')
        .setLock('pessimistic_write')
        .where('jogador.id IN (:...jogadoresIds)', { jogadoresIds })
        .andWhere('jogador.excluido_em IS NULL')
        .orderBy('jogador.id', 'ASC')
        .getMany();
      const jogadoresEncontrados = new Set(jogadores.map((jogador) => jogador.id));
      const idsAusentes = jogadoresIds.filter((id) => !jogadoresEncontrados.has(id));
      if (idsAusentes.length > 0) {
        throw new NotFoundException('Um ou mais jogadores não foram encontrados');
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

      // Valida vínculo, condição física e composição antes de substituir qualquer dado.
      const jogadorDeOutroClube = jogadores.find(
        (jogador) => jogador.clubeId !== clube.id,
      );
      if (jogadorDeOutroClube) {
        throw new ConflictException('Todos os jogadores devem pertencer ao clube');
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
    });
  }
}
