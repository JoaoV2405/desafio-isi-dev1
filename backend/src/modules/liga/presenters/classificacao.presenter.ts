import type { ClassificacaoResponse } from '../dto/classificacao.response.js';
import type { LinhaClassificacao } from '../types/classificacao.types.js';

export class ClassificacaoPresenter {
  static present(clube: LinhaClassificacao): ClassificacaoResponse {
    return {
      position: clube.posicao,
      club_id: clube.clubeId,
      club_name: clube.nomeClube,
      played: clube.jogos,
      wins: clube.vitorias,
      draws: clube.empates,
      losses: clube.derrotas,
      goals_for: clube.golsMarcados,
      goals_against: clube.golsSofridos,
      goal_difference: clube.saldoGols,
      points: clube.pontos,
    };
  }
}
