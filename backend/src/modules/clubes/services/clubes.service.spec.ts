import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  CondicaoJogador,
  Jogador,
  PosicaoJogador,
} from '../../jogadores/entities/jogador.entity.js';
import { Clube } from '../entities/clube.entity.js';
import { DetalhesClubeQuery } from '../queries/detalhes-clube.query.js';
import type { DetalhesClubeLeitura } from '../queries/detalhes-clube.types.js';
import { ClubesService } from './clubes.service.js';

describe('composição dos detalhes de clube', () => {
  const database = new DataSource({ type: 'postgres' });
  const repository = database.getRepository(Clube);
  const query = new DetalhesClubeQuery(repository);
  const service = new ClubesService(repository, database, query);
  const clube = { id: 1, nome: 'Clube Azul', sigla: 'CAZ', caixa: '280.25' };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-05T19:40:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function createPlayer(id: number): Jogador {
    return Object.assign(new Jogador(), {
      id,
      nome: 'Meia Lua',
      posicao: PosicaoJogador.Meia,
      agilidade: 85,
      idade: 25,
      valorBase: '40.00',
      condicao: CondicaoJogador.MalCondicionado,
      clubeId: 1,
      velocidade: 70,
      finalizacao: 68,
      passe: 82,
      drible: 79,
      defesa: 55,
      fisico: 64,
      potencial: 86,
    });
  }

  it('converte ausência da leitura em 404', async () => {
    vi.spyOn(query, 'findById').mockResolvedValue(null);
    await expect(service.findById(99)).rejects.toThrow(NotFoundException);
  });

  it('retorna patrimônio igual ao caixa para clube sem elenco', async () => {
    vi.spyOn(query, 'findById').mockResolvedValue({ clube, elenco: [] });
    await expect(service.findById(1)).resolves.toEqual({
      id: 1,
      name: 'Clube Azul',
      acronym: 'CAZ',
      cash: 280.25,
      squad_value: 0,
      net_worth: 280.25,
      players: [],
    });
  });

  it('calcula totais e fidelidade após ordenar os jogadores, preservando cada contrato', async () => {
    const leitura: DetalhesClubeLeitura = {
      clube,
      elenco: [
        {
          jogador: createPlayer(2),
          contrato: {
            valorCompra: '45.25',
            fidelidadeAte: new Date('2026-12-05T19:40:00.001Z'),
          },
        },
        {
          jogador: createPlayer(1),
          contrato: {
            valorCompra: '40.00',
            fidelidadeAte: new Date('2026-11-05T19:40:00Z'),
          },
        },
      ],
    };
    const findById = vi.spyOn(query, 'findById').mockResolvedValue(leitura);

    const result = await service.findById(1);

    expect(result).toMatchObject({
      cash: 280.25,
      squad_value: 74,
      net_worth: 354.25,
    });
    expect(result.players.map(({ id }) => id)).toEqual([1, 2]);
    expect(result.players[0]?.contract).toEqual({
      purchase_value: 40,
      loyalty_until: '2026-11-05T16:40:00-03:00',
      remaining_days: 0,
      penalty_rate: 0,
    });
    expect(result.players[1]?.contract).toEqual({
      purchase_value: 45.25,
      loyalty_until: '2026-12-05T16:40:00-03:00',
      remaining_days: 31,
      penalty_rate: 10,
    });
    expect(leitura.elenco.map(({ jogador }) => jogador.id)).toEqual([2, 1]);
    expect(findById).toHaveBeenCalledExactlyOnceWith(1);
  });

  it('retorna erro interno seguro para jogador vinculado sem contrato ativo', async () => {
    vi.spyOn(query, 'findById').mockResolvedValue({
      clube,
      elenco: [{ jogador: createPlayer(1), contrato: null }],
    });
    await expect(service.findById(1)).rejects.toThrow(
      InternalServerErrorException,
    );
    await expect(service.findById(1)).rejects.toThrow(
      'Não foi possível consultar o elenco do clube',
    );
  });
});
