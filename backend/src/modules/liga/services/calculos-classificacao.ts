import {
  compareText,
  normalizeForComparison,
} from '../../../core/text/ordenacao-texto.js';
import type {
  EstatisticasClube,
  LinhaClassificacao,
} from '../types/classificacao.types.js';

export function projectStandings(
  clubes: readonly EstatisticasClube[],
): LinhaClassificacao[] {
  return clubes
    .map((clube) => ({
      ...clube,
      pontos: clube.vitorias * 3 + clube.empates,
      saldoGols: clube.golsMarcados - clube.golsSofridos,
      nomeNormalizado: normalizeForComparison(clube.nomeClube),
    }))
    .sort(
      (first, second) =>
        second.pontos - first.pontos ||
        second.saldoGols - first.saldoGols ||
        second.golsMarcados - first.golsMarcados ||
        compareText(first.nomeNormalizado, second.nomeNormalizado) ||
        first.clubeId - second.clubeId,
    )
    .map(({ nomeNormalizado: _nomeNormalizado, ...clube }, index) => ({
      ...clube,
      posicao: index + 1,
    }));
}
