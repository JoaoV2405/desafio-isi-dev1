import type { EstatisticasClube } from '../types/classificacao.types.js';
import { projectStandings } from './calculos-classificacao.js';

function club(
  clubeId: number,
  changes: Partial<EstatisticasClube> = {},
): EstatisticasClube {
  return {
    clubeId,
    nomeClube: `Clube ${clubeId}`,
    jogos: 0,
    vitorias: 0,
    empates: 0,
    derrotas: 0,
    golsMarcados: 0,
    golsSofridos: 0,
    ...changes,
  };
}

describe('Projeção da classificação RN21', () => {
  it('retorna vazio sem clubes', () => {
    expect(projectStandings([])).toEqual([]);
  });

  it('calcula três pontos por vitória e um por empate', () => {
    const [result] = projectStandings([
      club(1, {
        jogos: 5,
        vitorias: 2,
        empates: 1,
        derrotas: 2,
        golsMarcados: 7,
        golsSofridos: 9,
      }),
    ]);
    expect(result).toMatchObject({ pontos: 7, saldoGols: -2, posicao: 1 });
  });

  it.each([
    ['pontos', club(1, { golsMarcados: 3 }), club(2, { jogos: 1, empates: 1 })],
    [
      'saldo de gols',
      club(1, { jogos: 1, vitorias: 1, golsMarcados: 2, golsSofridos: 1 }),
      club(2, { jogos: 1, vitorias: 1, golsMarcados: 2 }),
    ],
    [
      'gols marcados',
      club(1, {
        jogos: 2,
        vitorias: 1,
        derrotas: 1,
        golsMarcados: 2,
        golsSofridos: 2,
      }),
      club(2, {
        jogos: 2,
        vitorias: 1,
        derrotas: 1,
        golsMarcados: 4,
        golsSofridos: 4,
      }),
    ],
    [
      'nome normalizado',
      club(1, { nomeClube: 'Gama SC' }),
      club(2, { nomeClube: 'Épsilon EC' }),
    ],
    [
      'id com nomes normalizados iguais',
      club(2, { nomeClube: 'Aguias FC' }),
      club(1, { nomeClube: 'Águias FC' }),
    ],
  ])(
    'desempata por %s antes de aplicar os próximos critérios',
    (_criterion, worse, better) => {
      expect(
        projectStandings([worse, better]).map(({ clubeId }) => clubeId),
      ).toEqual([better.clubeId, worse.clubeId]);
    },
  );

  it('mantém clubes sem partidas à frente de clube sem pontos com saldo negativo', () => {
    const results = projectStandings([
      club(1, { jogos: 1, derrotas: 1, golsSofridos: 1 }),
      club(2),
    ]);
    expect(results.map(({ clubeId }) => clubeId)).toEqual([2, 1]);
    expect(results[0]).toMatchObject({
      pontos: 0,
      saldoGols: 0,
      jogos: 0,
      posicao: 1,
    });
  });

  it('atribui posições únicas sem alterar entradas nem expor chave de comparação', () => {
    const input = Object.freeze([
      Object.freeze(club(3, { nomeClube: 'Delta FC' })),
      Object.freeze(club(2, { nomeClube: 'Águias FC' })),
      Object.freeze(club(1, { nomeClube: 'Aguias FC' })),
    ]);
    const results = projectStandings(input);
    expect(results.map(({ clubeId, posicao }) => [clubeId, posicao])).toEqual([
      [1, 1],
      [2, 2],
      [3, 3],
    ]);
    expect(input.map(({ clubeId }) => clubeId)).toEqual([3, 2, 1]);
    expect(results[1].nomeClube).toBe('Águias FC');
    expect(results[0]).not.toHaveProperty('nomeNormalizado');
    expect(input[0]).not.toHaveProperty('pontos');
  });
});
