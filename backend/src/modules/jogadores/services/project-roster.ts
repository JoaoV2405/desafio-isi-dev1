import type { JogadorResponse } from '../dto/jogador.response.js';
import type { Jogador } from '../entities/jogador.entity.js';
import { JogadorPresenter } from '../presenters/jogador.presenter.js';
import {
  calcularOverall,
  calcularValorMercadoEmCentavos,
} from './calculos-jogador.js';
import { sortRoster } from './ordenacao-jogadores.js';

export type ProjecaoElenco = {
  players: JogadorResponse[];
  squadValueInCents: number;
};

export function projectRoster(jogadores: readonly Jogador[]): ProjecaoElenco {
  let squadValueInCents = 0;

  const players = sortRoster(jogadores).map((jogador) => {
    const marketValueInCents = calcularValorMercadoEmCentavos(
      jogador.valorBase,
      jogador.condicao,
      jogador.agilidade,
      jogador.idade,
    );
    squadValueInCents += marketValueInCents;

    return JogadorPresenter.present(jogador, {
      overall: calcularOverall(jogador.posicao, jogador),
      marketValueInCents,
    });
  });

  return { players, squadValueInCents };
}
