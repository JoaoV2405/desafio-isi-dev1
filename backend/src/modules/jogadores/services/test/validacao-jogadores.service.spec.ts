import { BadRequestException, ConflictException } from '@nestjs/common';
import { CriarJogadorDto } from '../../dto/criar-jogador.dto.js';
import { EditarJogadorDto } from '../../dto/editar-jogador.dto.js';
import type { FiltrosJogadores } from '../../dto/listar-jogadores.dto.js';
import {
  CondicaoJogador,
  Jogador,
  PosicaoJogador,
} from '../../entities/jogador.entity.js';
import { ValidacaoJogadoresService } from '../validacao-jogadores.service.js';

function createCreationDto(
  changes: Partial<CriarJogadorDto> = {},
): CriarJogadorDto {
  return new CriarJogadorDto(
    changes.name ?? 'João da Silva',
    changes.position ?? PosicaoJogador.Atacante,
    changes.agility ?? 80,
    changes.age ?? 21,
    changes.pace ?? 80,
    changes.shooting ?? 80,
    changes.passing ?? 80,
    changes.dribbling ?? 80,
    changes.defending ?? 70,
    changes.physical ?? 70,
    changes.potential ?? 90,
  );
}

function createPlayer(changes: Partial<Jogador> = {}): Jogador {
  return Object.assign(new Jogador(), {
    posicao: PosicaoJogador.Meia,
    agilidade: 80,
    idade: 30,
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
    ...changes,
  });
}

function createFilters(
  changes: Partial<FiltrosJogadores> = {},
): FiltrosJogadores {
  return {
    search: undefined,
    position: undefined,
    condition: undefined,
    free: undefined,
    clubId: undefined,
    minAge: 16,
    maxAge: 45,
    minValueInCents: 0,
    maxValueInCents: 55_000,
    sort: ['name'],
    page: 1,
    limit: 10,
    ...changes,
  };
}

describe('ValidacaoJogadoresService', () => {
  const service = new ValidacaoJogadoresService();

  describe('validateCreation', () => {
    it('accepts valid combined player data', () => {
      expect(() => service.validateCreation(createCreationDto())).not.toThrow();
    });

    it('rejects attributes whose sum is greater than 480', () => {
      expect(() =>
        service.validateCreation(
          createCreationDto({
            pace: 81,
            shooting: 81,
            passing: 81,
            dribbling: 81,
            defending: 81,
            physical: 81,
          }),
        ),
      ).toThrow(BadRequestException);
    });

    it('rejects potential below the highest attribute', () => {
      expect(() =>
        service.validateCreation(
          createCreationDto({ pace: 91, potential: 90 }),
        ),
      ).toThrow(BadRequestException);
    });

    it('requires potential equal to the highest attribute from age 33', () => {
      expect(() =>
        service.validateCreation(createCreationDto({ age: 33 })),
      ).toThrow(BadRequestException);

      expect(() =>
        service.validateCreation(createCreationDto({ age: 33, potential: 80 })),
      ).not.toThrow();
    });

    it('limits agility to 85 from age 35', () => {
      expect(() =>
        service.validateCreation(
          createCreationDto({ age: 35, agility: 86, potential: 80 }),
        ),
      ).toThrow(BadRequestException);
    });
  });

  describe('validateUpdate', () => {
    it('rejects a lower age', () => {
      const dto = new EditarJogadorDto(
        'João da Silva',
        PosicaoJogador.Meia,
        80,
        29,
      );

      expect(() => service.validateUpdate(dto, createPlayer())).toThrow(
        ConflictException,
      );
    });

    it('rejects a position change while the player has a club', () => {
      const dto = new EditarJogadorDto(
        'João da Silva',
        PosicaoJogador.Atacante,
        80,
        30,
      );

      expect(() =>
        service.validateUpdate(dto, createPlayer({ clubeId: 3 })),
      ).toThrow(ConflictException);
    });

    it('applies the agility restriction to the new age', () => {
      const dto = new EditarJogadorDto(
        'João da Silva',
        PosicaoJogador.Meia,
        86,
        35,
      );

      expect(() => service.validateUpdate(dto, createPlayer())).toThrow(
        BadRequestException,
      );
    });
  });

  it('rejects a direct transition from DOENTE to APTO', () => {
    expect(() =>
      service.validateConditionChange(
        CondicaoJogador.Doente,
        CondicaoJogador.Apto,
      ),
    ).toThrow(ConflictException);
  });

  it('allows removal only for a free player', () => {
    expect(() => service.validateRemoval(createPlayer())).not.toThrow();
    expect(() => service.validateRemoval(createPlayer({ clubeId: 2 }))).toThrow(
      ConflictException,
    );
  });

  it.each([
    createFilters({ minAge: 30, maxAge: 20 }),
    createFilters({ minValueInCents: 2_000, maxValueInCents: 1_000 }),
    createFilters({ free: true, clubId: 1 }),
    createFilters({ limit: 51 }),
  ])('rejects contradictory filters %#', (filters) => {
    expect(() => service.validateFilters(filters)).toThrow(BadRequestException);
  });

  it('exposes the domain calculations used by the use cases', () => {
    const dto = createCreationDto({
      position: PosicaoJogador.Meia,
      age: 25,
      pace: 70,
      shooting: 68,
      passing: 82,
      dribbling: 79,
      defending: 55,
      physical: 64,
      potential: 86,
    });
    const jogador = createPlayer();

    expect(service.calculateOverall(dto)).toBe(75);
    expect(service.calculateBaseValueInCents(dto)).toBe(4_000);
    expect(service.calculateMarketValueInCents(jogador)).toBe(4_000);
  });
});
