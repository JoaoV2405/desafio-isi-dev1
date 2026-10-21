import type { Jogador } from '../../jogadores/entities/jogador.entity.js';

export type ContratoAtivoLeitura = {
  valorCompra: string;
  fidelidadeAte: Date;
};

export type DetalhesClubeLeitura = {
  clube: {
    id: number;
    nome: string;
    sigla: string;
    caixa: string;
  };

  elenco: Array<{
    jogador: Jogador;
    contrato: ContratoAtivoLeitura | null;
  }>;
};
