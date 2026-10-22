export interface EstatisticasClube {
  clubeId: number;
  nomeClube: string;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsMarcados: number;
  golsSofridos: number;
}

export interface LinhaClassificacao extends EstatisticasClube {
  pontos: number;
  saldoGols: number;
  posicao: number;
}
