import { formatarDataBrasilia } from '../../../core/date/formatar-data-brasilia.js';
import { centavosParaNumero } from '../../../core/money/conversoes-monetarias.js';
import type { TermosFidelidade } from '../../contratos/index.js';
import type { JogadorResponse } from '../../jogadores/dto/jogador.response.js';
import {
  ClubeDetailResponse,
  ClubeResponse,
  JogadorDoClubeResponse,
} from '../dto/clube-response.js';
import type { DetalhesClubeLeitura } from '../queries/detalhes-clube.types.js';

export type TotaisClube = {
  cashInCents: number;
  squadValueInCents: number;
  netWorthInCents: number;
};

type JogadorClubeCalculado = {
  jogador: JogadorResponse;
  contrato: TermosFidelidade & {
    purchaseValueInCents: number;
    loyaltyUntil: Date;
  };
};

export class ClubePresenter {
  static present(
    clube: DetalhesClubeLeitura['clube'],
    totais: TotaisClube,
  ): ClubeResponse {
    return {
      id: clube.id,
      name: clube.nome,
      acronym: clube.sigla.trimEnd(),
      cash: centavosParaNumero(totais.cashInCents),
      squad_value: centavosParaNumero(totais.squadValueInCents),
      net_worth: centavosParaNumero(totais.netWorthInCents),
    };
  }

  static presentDetails(
    clube: DetalhesClubeLeitura['clube'],
    totais: TotaisClube,
    elenco: readonly JogadorClubeCalculado[],
  ): ClubeDetailResponse {
    const players = elenco.map(({ jogador, contrato }) =>
      Object.assign(new JogadorDoClubeResponse(), jogador, {
        contract: {
          purchase_value: centavosParaNumero(contrato.purchaseValueInCents),
          loyalty_until: formatarDataBrasilia(contrato.loyaltyUntil),
          remaining_days: contrato.remainingDays,
          penalty_rate: contrato.penaltyRate,
        },
      }),
    );

    return Object.assign(
      new ClubeDetailResponse(),
      this.present(clube, totais),
      {
        players,
      },
    );
  }
}
