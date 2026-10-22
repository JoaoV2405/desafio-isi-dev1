import {
  compareNames,
  compareText,
  normalizeForComparison,
} from './ordenacao-texto.js';

describe('Ordenação textual geral', () => {
  it('normaliza caixa, acentos e cedilha por NFD', () => {
    expect(normalizeForComparison('ÁGUIAS Ç Épsilon')).toBe('aguias c epsilon');
    expect(compareNames('Águias FC', 'Aguias FC')).toBe(0);
  });

  it.each([
    ['Ana Lima', 'Ana-Maria'],
    ['Clube', 'Clube Azul'],
    ['Delta FC', 'Épsilon EC'],
    ['Épsilon EC', 'Gama SC'],
  ])('ordena %s antes de %s', (first, second) => {
    expect(compareNames(first, second)).toBeLessThan(0);
    expect(compareNames(second, first)).toBeGreaterThan(0);
  });

  it('compara pontos de código, inclusive fora do BMP', () => {
    expect(compareText('\uFFFF', '\u{10000}')).toBeLessThan(0);
    expect(compareText('', '')).toBe(0);
  });
});
