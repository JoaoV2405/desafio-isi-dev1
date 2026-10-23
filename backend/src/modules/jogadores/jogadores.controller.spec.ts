import type { Response } from 'express';
import { CondicaoJogador, PosicaoJogador } from './entities/jogador.entity.js';
import { JogadoresController } from './jogadores.controller.js';
import { JogadoresService } from './services/jogadores.service.js';

const jogadorResponse = {
  id: 2,
  name: 'Meia Lua',
  position: PosicaoJogador.Meia,
  agility: 85,
  age: 25,
  condition: CondicaoJogador.Apto,
  base_value: 40,
  market_value: 40,
  pace: 70,
  shooting: 68,
  passing: 82,
  dribbling: 79,
  defending: 55,
  physical: 64,
  potential: 86,
  overall: 75,
  club_id: null,
};

const criarJogadorDto = {
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
};

describe('JogadoresController', () => {
  const jogadoresService = {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateCondition: vi.fn(),
    remove: vi.fn(),
  };
  const controller = new JogadoresController(
    jogadoresService as unknown as JogadoresService,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delega a criação e devolve 201 com Location', async () => {
    jogadoresService.create.mockResolvedValue(jogadorResponse);
    const location = vi.fn();
    const response = {
      location,
    } as unknown as Response;

    await expect(controller.create(criarJogadorDto, response)).resolves.toEqual(
      jogadorResponse,
    );

    expect(jogadoresService.create).toHaveBeenCalledWith(criarJogadorDto);
    expect(location).toHaveBeenCalledWith('/api/v1/players/2');
  });

  it('delega a exclusão e não devolve corpo', async () => {
    jogadoresService.remove.mockResolvedValue(undefined);

    await expect(controller.remove(2)).resolves.toBeUndefined();

    expect(jogadoresService.remove).toHaveBeenCalledWith(2);
  });
});
