import type { FormacaoClube } from '../../clubes/entities/clube.entity.js';
import type {
  Jogador,
  PosicaoJogador,
} from '../../jogadores/entities/jogador.entity.js';
import type {
  AtributoDuelo,
  CondicaoDuelo,
} from '../entities/duelo-partida.entity.js';

export type ResultadoPartida = 'MANDANTE' | 'VISITANTE' | 'EMPATE';
export type OrdemDuelo = 1 | 2 | 3 | 4 | 5 | 6;

export type CriarPartidaInput = {
  mandanteId: number;
  visitanteId: number;
};

export type TitularPartida = Pick<
  Jogador,
  | 'id'
  | 'nome'
  | 'posicao'
  | 'condicao'
  | 'finalizacao'
  | 'passe'
  | 'drible'
  | 'defesa'
>;

export type EscalacaoPartida = {
  clubeId: number;
  formacao: FormacaoClube;
  // Goleiro seguido dos quatro jogadores de linha, já na ordem do elenco.
  titulares: readonly [
    TitularPartida,
    TitularPartida,
    TitularPartida,
    TitularPartida,
    TitularPartida,
  ];
};

export type DueloCalculado = {
  ordem: OrdemDuelo;
  clubeAtacanteId: number;
  atacanteId: number;
  defensorId: number;
  nomeAtacante: string;
  nomeDefensor: string;
  posicaoAtacante: Exclude<PosicaoJogador, PosicaoJogador.Goleiro>;
  posicaoDefensor: PosicaoJogador;
  condicaoAtacante: CondicaoDuelo;
  condicaoDefensor: CondicaoDuelo;
  atributoAtaque: Exclude<AtributoDuelo, AtributoDuelo.Defesa>;
  atributoDefesa: AtributoDuelo.Defesa;
  valorAtaque: number;
  valorDefesa: number;
  gol: boolean;
};

export type PlacarPartida = {
  golsMandante: number;
  golsVisitante: number;
  resultado: ResultadoPartida;
};
