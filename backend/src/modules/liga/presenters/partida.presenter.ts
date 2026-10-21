import { formatarDataBrasilia } from '../../../core/date/formatar-data-brasilia.js';
import type {
  DueloPartidaResponse,
  PartidaDetalheResponse,
  PartidaResumoResponse,
} from '../dto/partida.response.js';
import type { DueloPartida } from '../entities/duelo-partida.entity.js';
import { calculateResult } from '../services/calculos-partida.js';
import type {
  DetalhePartida,
  ResumoPartida,
} from '../types/historico-partida.types.js';

export class PartidaPresenter {
  static presentSummary(
    partida: Omit<ResumoPartida, 'resultado'>,
  ): PartidaResumoResponse {
    return {
      id: partida.id,
      played_at: formatarDataBrasilia(partida.jogadaEm),
      home: {
        club_id: partida.mandanteId,
        club_name: partida.mandante.nome,
        formation: partida.formacaoMandante,
        goals: partida.golsMandante,
      },
      away: {
        club_id: partida.visitanteId,
        club_name: partida.visitante.nome,
        formation: partida.formacaoVisitante,
        goals: partida.golsVisitante,
      },
      result: calculateResult(partida.golsMandante, partida.golsVisitante),
    };
  }

  static presentDetail(
    partida: Omit<DetalhePartida, 'resultado'>,
  ): PartidaDetalheResponse {
    return Object.assign(this.presentSummary(partida), {
      duels: partida.duelos
        .toSorted((a, b) => a.ordem - b.ordem)
        .map((duelo) => this.presentDuel(duelo)),
    });
  }

  private static presentDuel(duelo: DueloPartida): DueloPartidaResponse {
    // O contrato histórico usa somente snapshots, inclusive após a exclusão de um participante.
    return {
      order: duelo.ordem,
      attacking_club_id: duelo.clubeAtacanteId,
      attacker: {
        player_id: duelo.atacanteId,
        player_name: duelo.nomeAtacante,
        position: duelo.posicaoAtacante,
        condition: duelo.condicaoAtacante,
        attribute: duelo.atributoAtaque,
        value: duelo.valorAtaque,
      },
      defender: {
        player_id: duelo.defensorId,
        player_name: duelo.nomeDefensor,
        position: duelo.posicaoDefensor,
        condition: duelo.condicaoDefensor,
        attribute: duelo.atributoDefesa,
        value: duelo.valorDefesa,
      },
      goal: duelo.gol,
    };
  }
}
