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

  return arredondarProximoInteiro(
    primeiraFaixa * 10 + excedente * 20,
    100,
  );
}

export function calcularDiasRestantes(
  fidelidadeAte: Date,
  instante: Date,
): number {
  const diferenca = fidelidadeAte.getTime() - instante.getTime();

  return diferenca <= 0 ? 0 : Math.ceil(diferenca / 86_400_000);
}

export function calcularPercentualMulta(diasRestantes: number): number {
  if (diasRestantes === 0) return 0;
  if (diasRestantes <= 30) return 5;
  if (diasRestantes <= 180) return 10;
  return 20;
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

export function formatarDataBrasilia(instante: Date): string {
  const horarioBrasilia = new Date(instante.getTime() - 3 * 60 * 60 * 1_000);
  const preencher = (valor: number): string => String(valor).padStart(2, '0');
  const ano = horarioBrasilia.getUTCFullYear();
  const mes = preencher(horarioBrasilia.getUTCMonth() + 1);
  const dia = preencher(horarioBrasilia.getUTCDate());
  const hora = preencher(horarioBrasilia.getUTCHours());
  const minuto = preencher(horarioBrasilia.getUTCMinutes());
  const segundo = preencher(horarioBrasilia.getUTCSeconds());

  return `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}-03:00`;
}
