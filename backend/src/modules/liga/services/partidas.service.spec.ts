import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Clube } from '../../clubes/entities/clube.entity.js';
import { Jogador } from '../../jogadores/entities/jogador.entity.js';
import { JogadoresService } from '../../jogadores/services/jogadores.service.js';
import { ValidacaoJogadoresService } from '../../jogadores/services/validacao-jogadores.service.js';
import { Partida } from '../entities/partida.entity.js';
import { PartidasService } from './partidas.service.js';

describe('PartidasService', () => {
  const database = new DataSource({ type: 'postgres' });
  const jogadores = new JogadoresService(
    database.getRepository(Jogador),
    database.getRepository(Clube),
    new ValidacaoJogadoresService(),
    database,
  );
  const service = new PartidasService(database, jogadores);
  const input = { mandanteId: 1, visitanteId: 2 };
  const serializacao = Object.assign(new Error('concurrent update'), {
    driverError: { code: '40001' },
  });

  afterEach(() => vi.restoreAllMocks());

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2_147_483_648])(
    'recusa o filtro numérico inválido %s com 400',
    async (clubeId) => {
      await expect(service.findAll(clubeId)).rejects.toThrow(
        BadRequestException,
      );
    },
  );

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2_147_483_648])(
    'recusa o id numérico inválido %s com 404',
    async (id) => {
      await expect(service.findById(id)).rejects.toThrow(NotFoundException);
    },
  );

  it('repete toda a transação quando há falha de serialização e retorna só o sucesso', async () => {
    const partida = Object.assign(new Partida(), { id: 9 });
    const transaction = vi
      .spyOn(database, 'transaction')
      .mockRejectedValueOnce(serializacao)
      .mockRejectedValueOnce(serializacao)
      .mockResolvedValueOnce(partida);

    await expect(service.create(input)).resolves.toBe(partida);
    expect(transaction).toHaveBeenCalledTimes(3);
    expect(transaction).toHaveBeenCalledWith(
      'REPEATABLE READ',
      expect.any(Function),
    );
  });

  it('limita a três tentativas e preserva a causa do conflito', async () => {
    const transaction = vi
      .spyOn(database, 'transaction')
      .mockRejectedValue(serializacao);
    await expect(service.create(input)).rejects.toMatchObject({
      cause: serializacao,
      status: 409,
    });
    expect(transaction).toHaveBeenCalledTimes(3);
  });

  it.each([
    new Error('falha inesperada'),
    new ConflictException('escalação incompleta'),
    Object.assign(new Error('foreign key'), { driverError: { code: '23503' } }),
  ])('não repete nem oculta outros erros: %s', async (error) => {
    const transaction = vi
      .spyOn(database, 'transaction')
      .mockRejectedValue(error);
    await expect(service.create(input)).rejects.toBe(error);
    expect(transaction).toHaveBeenCalledTimes(1);
  });
});
