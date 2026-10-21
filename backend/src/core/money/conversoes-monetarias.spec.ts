import {
  centavosParaDecimal,
  centavosParaNumero,
  decimalParaCentavos,
} from './conversoes-monetarias.js';

describe('conversões monetárias compartilhadas', () => {
  it.each([
    ['0', 0],
    ['1.05', 105],
    ['261.15', 26_115],
    ['-38.85', -3_885],
    ['99999999.99', 9_999_999_999],
  ])(
    'converte %s para %i centavos sem multiplicar decimais',
    (decimal, cents) => {
      expect(decimalParaCentavos(decimal)).toBe(cents);
      expect(centavosParaNumero(cents)).toBe(Number(decimal));
    },
  );

  it.each(['1.001', '1,05', '1e2', 'NaN', ''])(
    'recusa o decimal inválido %s',
    (valor) => {
      expect(() => decimalParaCentavos(valor)).toThrow(
        'Valor decimal inválido',
      );
    },
  );

  it.each([
    [0, '0.00'],
    [105, '1.05'],
    [-3_885, '-38.85'],
  ])('serializa %i centavos como %s para o banco', (cents, decimal) => {
    expect(centavosParaDecimal(cents)).toBe(decimal);
  });
});
