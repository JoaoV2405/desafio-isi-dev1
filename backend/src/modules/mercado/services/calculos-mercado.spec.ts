import { describe, expect, it } from 'vitest';
import {
  calcularComissaoVenda,
  calcularMultaVenda,
  calcularTaxaCompra,
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

  it('limita a multa a 10,00', () => {
    expect(calcularMultaVenda(4_000, 10)).toBe(400);
    expect(calcularMultaVenda(7_500, 20)).toBe(1_000);
  });
});
