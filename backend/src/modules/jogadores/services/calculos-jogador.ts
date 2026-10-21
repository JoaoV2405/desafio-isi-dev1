import { decimalParaCentavos } from '../../../core/money/conversoes-monetarias.js';
import { CondicaoJogador, PosicaoJogador } from '../entities/jogador.entity.js';

type AtributosJogador = {
  velocidade: number;
  finalizacao: number;
  passe: number;
  drible: number;
  defesa: number;
  fisico: number;
};

const PESOS_POR_POSICAO: Record<
  PosicaoJogador,
  readonly [number, number, number, number, number, number]
> = {
  [PosicaoJogador.Goleiro]: [10, 0, 20, 0, 40, 30],
  [PosicaoJogador.Zagueiro]: [10, 0, 15, 0, 45, 30],
  [PosicaoJogador.Lateral]: [25, 0, 20, 15, 25, 15],
  [PosicaoJogador.Meia]: [10, 15, 35, 25, 5, 10],
  [PosicaoJogador.Atacante]: [20, 40, 10, 20, 0, 10],
};

export function calcularOverall(
  posicao: PosicaoJogador,
  atributos: AtributosJogador,
): number {
  // O overall usa os pesos específicos da posição e arredonda o resultado inteiro com meio para cima.
  const pesos = PESOS_POR_POSICAO[posicao];
  const valores = [
    atributos.velocidade,
    atributos.finalizacao,
    atributos.passe,
    atributos.drible,
    atributos.defesa,
    atributos.fisico,
  ];
  const somaPonderada = valores.reduce(
    (soma, atributo, indice) => soma + atributo * pesos[indice],
    0,
  );

  return Math.floor((somaPonderada + 50) / 100);
}

export function calcularValorBaseEmCentavos(
  overall: number,
  potencial: number,
  idade: number,
): number {
  // O valor base nasce uma vez do overall, com faixas progressivas, bônus jovem e piso de um real.
  const pontosPrimeiraFaixa = Math.max(0, Math.min(overall, 60) - 40);
  const pontosSegundaFaixa = Math.max(0, Math.min(overall, 75) - 60);
  const pontosTerceiraFaixa = Math.max(0, overall - 75);
  let valorEmCentavos =
    pontosPrimeiraFaixa * 50 +
    pontosSegundaFaixa * 200 +
    pontosTerceiraFaixa * 600;

  if (idade <= 21) {
    const numerador = valorEmCentavos * (100 + potencial - overall);
    valorEmCentavos = Math.floor((numerador + 50) / 100);
  }

  return Math.max(100, valorEmCentavos);
}

export function calcularValorMercadoEmCentavos(
  valorBase: string,
  condicao: CondicaoJogador,
  agilidade: number,
  idade: number,
): number {
  // O valor de mercado é recalculado em centavos a partir da condição, agilidade e idade atuais.
  const valorBaseEmCentavos = decimalParaCentavos(valorBase);
  let descontoEmDecimos = {
    [CondicaoJogador.Apto]: 0,
    [CondicaoJogador.MalCondicionado]: 150,
    [CondicaoJogador.Doente]: 300,
  }[condicao];

  if (condicao !== CondicaoJogador.Apto && agilidade >= 80) {
    descontoEmDecimos /= 2;
  } else if (condicao !== CondicaoJogador.Apto && agilidade <= 30) {
    descontoEmDecimos += 100;
  }

  const ajusteIdadeEmDecimos = idade <= 21 ? 100 : idade >= 32 ? -100 : 0;
  const percentualTotalEmDecimos = Math.max(
    -400,
    ajusteIdadeEmDecimos - descontoEmDecimos,
  );
  const numerador = valorBaseEmCentavos * (1_000 + percentualTotalEmDecimos);
  const valorMercadoEmCentavos = Math.floor((numerador + 500) / 1_000);

  return Math.max(100, valorMercadoEmCentavos);
}
