import { describe, expect, it } from 'vitest';
import {
  calcularComissaoVenda,
  calcularDiasRestantes,
  calcularMultaVenda,
  calcularPercentualMulta,
  calcularTaxaCompra,
  centavosParaDecimal,
  decimalParaCentavos,
} from './calculos-mercado.js';

describe('cálculos de mercado', () => {
  it('cobra a taxa de compra somente acima de 30,00 e arredonda para centavos', () => {
    expect(calcularTaxaCompra(3_000)).toBe(0);
    expect(calcularTaxaCompra(3_001)).toBe(150);
    expect(calcularTaxaCompra(3_100)).toBe(155);
  });

  it('calcula a comissão progressiva e arredonda uma única vez', () => {
    expect(calcularComissaoVenda(-750)).toBe(0);
    expect(calcularComissaoVenda(385)).toBe(39);
    expect(calcularComissaoVenda(1_001)).toBe(100);
    expect(calcularComissaoVenda(1_500)).toBe(200);
  });

  it('arredonda os dias restantes para cima e aplica as faixas de multa', () => {
    const instante = new Date('2026-11-05T19:40:00.000Z');

    expect(
      calcularDiasRestantes(
        new Date(instante.getTime() + 10 * 86_400_000 + 1),
        instante,
      ),
    ).toBe(11);
    expect(calcularPercentualMulta(0)).toBe(0);
    expect(calcularPercentualMulta(30)).toBe(5);
    expect(calcularPercentualMulta(31)).toBe(10);
    expect(calcularPercentualMulta(180)).toBe(10);
    expect(calcularPercentualMulta(181)).toBe(20);
  });

  it('limita a multa a 10,00', () => {
    expect(calcularMultaVenda(4_000, 10)).toBe(400);
    expect(calcularMultaVenda(7_500, 20)).toBe(1_000);
  });

  it('converte valores decimais com sinal entre banco e centavos', () => {
    expect(decimalParaCentavos('261.15')).toBe(26_115);
    expect(decimalParaCentavos('-38.85')).toBe(-3_885);
    expect(centavosParaDecimal(-3_885)).toBe('-38.85');
  });
});
