export function decimalParaCentavos(valor: string): number {
  const correspondencia = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(valor);

  if (!correspondencia) {
    throw new Error('Valor decimal inválido recebido do banco');
  }

  const [, sinal, parteInteira, parteDecimal = ''] = correspondencia;
  const centavos =
    Number(parteInteira) * 100 + Number(parteDecimal.padEnd(2, '0'));

  return sinal === '-' ? -centavos : centavos;
}

export function centavosParaDecimal(valor: number): string {
  const sinal = valor < 0 ? '-' : '';
  const centavosAbsolutos = Math.abs(valor);
  const inteiros = Math.floor(centavosAbsolutos / 100);
  const fracao = String(centavosAbsolutos % 100).padStart(2, '0');

  return `${sinal}${inteiros}.${fracao}`;
}

export function centavosParaNumero(valor: number): number {
  return valor / 100;
}
