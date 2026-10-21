import {
  CondicaoJogador,
  PosicaoJogador,
} from '../../jogadores/entities/jogador.entity.js';
import {
  AtributoDuelo,
  type CondicaoDuelo,
} from '../entities/duelo-partida.entity.js';
import type {
  DueloCalculado,
  EscalacaoPartida,
  OrdemDuelo,
  PlacarPartida,
  ResultadoPartida,
  TitularPartida,
} from '../types/partida.types.js';

export function calculateEffectiveAttribute(
  valor: number,
  condicao: CondicaoDuelo,
): number {
  // A aritmética inteira preserva o meio para cima sem aproximação de ponto flutuante.
  return condicao === CondicaoJogador.MalCondicionado
    ? Math.floor((valor * 85 + 50) / 100)
    : valor;
}

export function calculateDuels(
  mandante: EscalacaoPartida,
  visitante: EscalacaoPartida,
): DueloCalculado[] {
  const casa = mandante.titulares;
  const fora = visitante.titulares;

  // Os índices são do elenco ordenado: 0 é goleiro; 1–4 são os jogadores de linha.
  return [
    calculateDuel(1, mandante.clubeId, casa[4], fora[0]),
    calculateDuel(2, mandante.clubeId, casa[3], fora[1]),
    calculateDuel(3, mandante.clubeId, casa[2], fora[2]),
    calculateDuel(4, visitante.clubeId, fora[4], casa[0]),
    calculateDuel(5, visitante.clubeId, fora[3], casa[1]),
    calculateDuel(6, visitante.clubeId, fora[2], casa[2]),
  ];
}

export function calculateScore(
  duelos: readonly DueloCalculado[],
): PlacarPartida {
  const golsMandante = duelos.filter(
    (duelo) => duelo.ordem <= 3 && duelo.gol,
  ).length;
  const golsVisitante = duelos.filter(
    (duelo) => duelo.ordem >= 4 && duelo.gol,
  ).length;

  return {
    golsMandante,
    golsVisitante,
    resultado: calculateResult(golsMandante, golsVisitante),
  };
}

export function calculateResult(
  golsMandante: number,
  golsVisitante: number,
): ResultadoPartida {
  if (golsMandante > golsVisitante) return 'MANDANTE';
  if (golsVisitante > golsMandante) return 'VISITANTE';
  return 'EMPATE';
}

function calculateDuel(
  ordem: OrdemDuelo,
  clubeAtacanteId: number,
  atacante: TitularPartida,
  defensor: TitularPartida,
): DueloCalculado {
  if (
    atacante.posicao === PosicaoJogador.Goleiro ||
    atacante.condicao === CondicaoJogador.Doente ||
    defensor.condicao === CondicaoJogador.Doente
  ) {
    throw new Error('Titulares inválidos para calcular o duelo');
  } //retirar metodo daqui

  const [atributoAtaque, valorCadastrado] = selectAttack(atacante);
  const valorAtaque = calculateEffectiveAttribute(
    valorCadastrado,
    atacante.condicao,
  );
  const valorDefesa = calculateEffectiveAttribute(
    defensor.defesa,
    defensor.condicao,
  );

  return {
    ordem,
    clubeAtacanteId,
    atacanteId: atacante.id,
    defensorId: defensor.id,
    nomeAtacante: atacante.nome,
    nomeDefensor: defensor.nome,
    posicaoAtacante: atacante.posicao,
    posicaoDefensor: defensor.posicao,
    condicaoAtacante: atacante.condicao,
    condicaoDefensor: defensor.condicao,
    atributoAtaque,
    atributoDefesa: AtributoDuelo.Defesa,
    valorAtaque,
    valorDefesa,
    gol: valorAtaque > valorDefesa,
  };
}

function selectAttack(
  jogador: TitularPartida,
): [DueloCalculado['atributoAtaque'], number] {
  switch (jogador.posicao) {
    case PosicaoJogador.Atacante:
      return [AtributoDuelo.Finalizacao, jogador.finalizacao];
    case PosicaoJogador.Meia:
      return [AtributoDuelo.Passe, jogador.passe];
    case PosicaoJogador.Zagueiro:
    case PosicaoJogador.Lateral:
      return [AtributoDuelo.Drible, jogador.drible];
    case PosicaoJogador.Goleiro:
      throw new Error('Goleiro não pode atacar em um duelo');
  }
}
