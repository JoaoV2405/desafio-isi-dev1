import type { JogadorResponse } from '../dto/jogador.response.js';
import type { Jogador } from '../entities/jogador.entity.js';

type ValoresDerivadosJogador = {
  overall: number;
  marketValueInCents: number;
};

export class JogadorPresenter {
  static present(
    jogador: Jogador,
    valores: ValoresDerivadosJogador,
  ): JogadorResponse {
    return {
      id: jogador.id,
      name: jogador.nome,
      position: jogador.posicao,
      agility: jogador.agilidade,
      age: jogador.idade,
      condition: jogador.condicao,
      base_value: Number(jogador.valorBase),
      market_value: centavosParaNumero(valores.marketValueInCents),
      pace: jogador.velocidade,
      shooting: jogador.finalizacao,
      passing: jogador.passe,
      dribbling: jogador.drible,
      defending: jogador.defesa,
      physical: jogador.fisico,
      potential: jogador.potencial,
      overall: valores.overall,
      club_id: jogador.clubeId,
    };
  }
}
import { centavosParaNumero } from '../../../core/money/conversoes-monetarias.js';
