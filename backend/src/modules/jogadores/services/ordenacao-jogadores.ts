import {
  compareText,
  normalizeForComparison,
} from '../../../core/text/ordenacao-texto.js';
import { type Jogador, PosicaoJogador } from '../entities/jogador.entity.js';

type JogadorOrdenavel = {
  jogador: Jogador;
  normalizedName: string;
};

const ORDEM_POSICOES: Record<PosicaoJogador, number> = {
  [PosicaoJogador.Goleiro]: 0,
  [PosicaoJogador.Zagueiro]: 1,
  [PosicaoJogador.Lateral]: 2,
  [PosicaoJogador.Meia]: 3,
  [PosicaoJogador.Atacante]: 4,
};

export function sortRoster(jogadores: readonly Jogador[]): Jogador[] {
  return jogadores
    .map((jogador) => ({
      jogador,
      normalizedName: normalizeForComparison(jogador.nome),
    }))
    .sort(
      (a, b) =>
        comparePositions(a.jogador, b.jogador) || compareNameAndId(a, b),
    )
    .map(({ jogador }) => jogador);
}

export function comparePositions(a: Jogador, b: Jogador): number {
  return ORDEM_POSICOES[a.posicao] - ORDEM_POSICOES[b.posicao];
}

export function compareNameAndId(
  a: JogadorOrdenavel,
  b: JogadorOrdenavel,
): number {
  return (
    compareText(a.normalizedName, b.normalizedName) ||
    a.jogador.id - b.jogador.id
  );
}
