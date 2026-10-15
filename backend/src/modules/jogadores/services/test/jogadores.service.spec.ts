import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource, type EntityManager, type Repository } from 'typeorm';
import { Clube } from '../../../clubes/entities/clube.entity.js';
import { Escalacao } from '../../../liga/entities/escalacao.entity.js';
import {
  CondicaoJogador,
  Jogador,
  PosicaoJogador,
} from '../../entities/jogador.entity.js';
import { JogadoresService } from '../jogadores.service.js';
import { ValidacaoJogadoresService } from '../validacao-jogadores.service.js';

function criarJogador(alteracoes: Partial<Jogador> = {}): Jogador {
  return Object.assign(new Jogador(), {
    id: 1,
    nome: 'Meia Lua',
    posicao: PosicaoJogador.Meia,
    agilidade: 85,
    idade: 25,
    valorBase: '40.00',
    condicao: CondicaoJogador.Apto,
    clubeId: null,
    velocidade: 70,
    finalizacao: 68,
    passe: 82,
    drible: 79,
    defesa: 55,
    fisico: 64,
    potencial: 86,
    excluidoEm: null,
    criadoEm: new Date('2026-01-01T00:00:00Z'),
    atualizadoEm: new Date('2026-01-01T00:00:00Z'),
    clube: null,
    ...alteracoes,
  });
}

describe('JogadoresService', () => {
  const jogadoresRepository = {
    save: vi.fn(),
    find: vi.fn(),
    findOneBy: vi.fn(),
    softRemove: vi.fn(),
  };
  const clubesRepository = {
    existsBy: vi.fn(),
  };
  const repositoryTransacional = {
    findOneBy: vi.fn(),
    save: vi.fn(),
  };
  const manager = {
    getRepository: vi.fn(),
    delete: vi.fn(),
  };
  const dataSource = {
    transaction: vi.fn(),
  };
  const validacao = new ValidacaoJogadoresService();
  const service = new JogadoresService(
    jogadoresRepository as unknown as Repository<Jogador>,
    clubesRepository as unknown as Repository<Clube>,
    validacao,
    dataSource as unknown as DataSource,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    jogadoresRepository.save.mockImplementation(async (jogador) =>
      Object.assign(criarJogador(), jogador),
    );
    repositoryTransacional.save.mockImplementation(async (jogador) => jogador);
    manager.getRepository.mockReturnValue(repositoryTransacional);
    dataSource.transaction.mockImplementation(
      async (operacao: (entityManager: EntityManager) => unknown) =>
        operacao(manager as unknown as EntityManager),
    );
  });

  it('cria o jogador livre e APTO com valor base calculado', async () => {
    const response = await service.create({
      name: 'Meia Lua',
      position: PosicaoJogador.Meia,
      agility: 85,
      age: 25,
      pace: 70,
      shooting: 68,
      passing: 82,
      dribbling: 79,
      defending: 55,
      physical: 64,
      potential: 86,
      club_id: 9,
      condition: 'DOENTE',
    });

    expect(jogadoresRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        valorBase: '40.00',
        condicao: CondicaoJogador.Apto,
        clubeId: null,
      }),
    );
    expect(response).toMatchObject({
      name: 'Meia Lua',
      base_value: 40,
      market_value: 40,
      overall: 75,
      club_id: null,
    });
  });

  it('lista aplicando busca sem acento, filtro, ordenação e paginação', async () => {
    jogadoresRepository.find.mockResolvedValue([
      criarJogador({ id: 1, nome: 'Álvaro Lima', idade: 30 }),
      criarJogador({ id: 2, nome: 'Alvaro Melo', idade: 20 }),
      criarJogador({ id: 3, nome: 'Bruno Lima', clubeId: 4 }),
    ]);

    const resultado = await service.findAll({
      search: 'alvaro',
      free: 'true',
      sort: 'age_desc',
      page: '1',
      limit: '1',
    });

    expect(resultado.data.map(({ id }) => id)).toEqual([1]);
    expect(resultado.meta).toEqual({
      page: 1,
      limit: 1,
      total_items: 2,
      total_pages: 2,
    });
  });

  it('retorna 404 ao filtrar por clube inexistente', async () => {
    clubesRepository.existsBy.mockResolvedValue(false);

    await expect(service.findAll({ club_id: '99' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('retorna 404 ao buscar jogador inexistente', async () => {
    jogadoresRepository.findOneBy.mockResolvedValue(null);

    await expect(service.findById(99)).rejects.toThrow(NotFoundException);
  });

  it('atualiza somente os campos editáveis', async () => {
    const jogador = criarJogador();
    jogadoresRepository.findOneBy.mockResolvedValue(jogador);

    const response = await service.update(1, {
      name: 'Meia Nova',
      position: PosicaoJogador.Atacante,
      agility: 82,
      age: 26,
    });

    expect(jogadoresRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Meia Nova',
        posicao: PosicaoJogador.Atacante,
        agilidade: 82,
        idade: 26,
        velocidade: 70,
        potencial: 86,
        valorBase: '40.00',
      }),
    );
    expect(response).toMatchObject({
      name: 'Meia Nova',
      position: PosicaoJogador.Atacante,
      age: 26,
      base_value: 40,
    });
  });

  it('impede reduzir a idade e mudar posição de jogador vinculado', async () => {
    jogadoresRepository.findOneBy.mockResolvedValue(
      criarJogador({ clubeId: 3, idade: 30 }),
    );

    await expect(
      service.update(1, {
        name: 'Meia Lua',
        position: PosicaoJogador.Meia,
        agility: 80,
        age: 29,
      }),
    ).rejects.toThrow(ConflictException);

    await expect(
      service.update(1, {
        name: 'Meia Lua',
        position: PosicaoJogador.Atacante,
        agility: 80,
        age: 30,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('remove a escalação na mesma transação ao marcar como DOENTE', async () => {
    repositoryTransacional.findOneBy.mockResolvedValue(criarJogador());

    const response = await service.updateCondition(1, {
      condition: CondicaoJogador.Doente,
    });

    expect(manager.delete).toHaveBeenCalledWith(Escalacao, { jogadorId: 1 });
    expect(repositoryTransacional.save).toHaveBeenCalledWith(
      expect.objectContaining({ condicao: CondicaoJogador.Doente }),
    );
    expect(response.condition).toBe(CondicaoJogador.Doente);
  });

  it('impede a transição direta de DOENTE para APTO', async () => {
    repositoryTransacional.findOneBy.mockResolvedValue(
      criarJogador({ condicao: CondicaoJogador.Doente }),
    );

    await expect(
      service.updateCondition(1, { condition: CondicaoJogador.Apto }),
    ).rejects.toThrow(ConflictException);
  });

  it('não grava nem altera escalação ao repetir a condição atual', async () => {
    repositoryTransacional.findOneBy.mockResolvedValue(criarJogador());

    const response = await service.updateCondition(1, {
      condition: CondicaoJogador.Apto,
    });

    expect(response.condition).toBe(CondicaoJogador.Apto);
    expect(repositoryTransacional.save).not.toHaveBeenCalled();
    expect(manager.delete).not.toHaveBeenCalled();
  });

  it('faz exclusão lógica somente de jogador livre', async () => {
    const livre = criarJogador();
    jogadoresRepository.findOneBy.mockResolvedValueOnce(livre);

    await service.remove(1);

    expect(jogadoresRepository.softRemove).toHaveBeenCalledWith(livre);

    jogadoresRepository.findOneBy.mockResolvedValueOnce(
      criarJogador({ clubeId: 2 }),
    );

    await expect(service.remove(1)).rejects.toThrow(ConflictException);
  });
});
