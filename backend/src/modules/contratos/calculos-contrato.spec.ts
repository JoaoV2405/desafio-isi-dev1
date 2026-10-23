import { calculateLoyaltyTerms } from './index.js';

describe('termos de fidelidade pela interface pública de contratos', () => {
  const instante = new Date('2026-11-05T19:40:00Z');
  const dia = 86_400_000;

  it.each([
    [-1, 0, 0],
    [0, 0, 0],
    [1, 1, 5],
    [dia, 1, 5],
    [10 * dia + 1, 11, 5],
    [30 * dia, 30, 5],
    [30 * dia + 1, 31, 10],
    [180 * dia, 180, 10],
    [180 * dia + 1, 181, 20],
  ])(
    'para uma diferença de %i ms retorna %i dias e %i%%',
    (diferenca, dias, percentual) => {
      expect(
        calculateLoyaltyTerms(
          new Date(instante.getTime() + diferenca),
          instante,
        ),
      ).toEqual({
        remainingDays: dias,
        penaltyRate: percentual,
      });
      expect(instante.toISOString()).toBe('2026-11-05T19:40:00.000Z');
    },
  );
});
