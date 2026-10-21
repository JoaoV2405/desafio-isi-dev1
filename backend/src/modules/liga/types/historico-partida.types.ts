import type { Clube } from '../../clubes/entities/clube.entity.js';
import type { DueloPartida } from '../entities/duelo-partida.entity.js';
import type { Partida } from '../entities/partida.entity.js';
import type { ResultadoPartida } from './partida.types.js';

export type ResumoPartida = Pick<
  Partida,
  | 'id'
  | 'jogadaEm'
  | 'mandanteId'
  | 'visitanteId'
  | 'golsMandante'
  | 'golsVisitante'
  | 'formacaoMandante'
  | 'formacaoVisitante'
> & {
  mandante: Pick<Clube, 'id' | 'nome'>;
  visitante: Pick<Clube, 'id' | 'nome'>;
  resultado: ResultadoPartida;
};

export type DetalhePartida = ResumoPartida & {
  duelos: DueloPartida[];
};
