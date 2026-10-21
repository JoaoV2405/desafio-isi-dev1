export function arredondarProximoInteiro(
  numerador: number,
  denominador: number,
): number {
  const sinal = numerador < 0 ? -1 : 1;
  const absoluto = Math.abs(numerador);

  return sinal * Math.floor((absoluto + denominador / 2) / denominador);
}

export function calcularTaxaCompra(valorEmCentavos: number): number {
  return valorEmCentavos > 3_000
    ? arredondarProximoInteiro(valorEmCentavos * 5, 100)
    : 0;
}

export function calcularComissaoVenda(lucroEmCentavos: number): number {
  if (lucroEmCentavos <= 0) return 0;

  const primeiraFaixa = Math.min(lucroEmCentavos, 1_000);
  const excedente = Math.max(0, lucroEmCentavos - 1_000);

  return arredondarProximoInteiro(primeiraFaixa * 10 + excedente * 20, 100);
}

export function calcularMultaVenda(
  valorEmCentavos: number,
  percentual: number,
): number {
  return Math.min(
    1_000,
    arredondarProximoInteiro(valorEmCentavos * percentual, 100),
  );
}
