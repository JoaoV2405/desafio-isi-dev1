import {
  Clube,
  FormacaoClube,
} from '../../src/modules/clubes/entities/clube.entity.js';
import {
  CondicaoJogador,
  Jogador,
  PosicaoJogador,
} from '../../src/modules/jogadores/entities/jogador.entity.js';
import type { EscalacaoPartida } from '../../src/modules/liga/types/partida.types.js';
import { DueloPartida } from '../../src/modules/liga/entities/duelo-partida.entity.js';
import { Partida } from '../../src/modules/liga/entities/partida.entity.js';
import { calculateDuels } from '../../src/modules/liga/services/calculos-partida.js';

export function createRecordedMatch(): Partida {
  const { mandante, visitante } = createExampleLineups();
  return Object.assign(new Partida(), {
    id: 9,
    jogadaEm: new Date('2026-10-20T19:00:49.987Z'),
    mandanteId: 1,
    visitanteId: 2,
    golsMandante: 1,
    golsVisitante: 2,
    formacaoMandante: mandante.formacao,
    formacaoVisitante: visitante.formacao,
    mandante: Object.assign(new Clube(), {
      id: 1,
      nome: 'Águias FC',
      formacao: FormacaoClube.TresUm,
      caixa: '999.00',
    }),
    visitante: Object.assign(new Clube(), {
      id: 2,
      nome: 'Delta FC',
      formacao: FormacaoClube.DoisDois,
    }),
    duelos: calculateDuels(mandante, visitante).map((duelo, indice) =>
      Object.assign(new DueloPartida(), duelo, {
        id: indice + 1,
        partidaId: 9,
      }),
    ),
  });
}

type EscalacaoFixture = Omit<EscalacaoPartida, 'titulares'> & {
  titulares: [Jogador, Jogador, Jogador, Jogador, Jogador];
};

export function createPlayer(alteracoes: Partial<Jogador>): Jogador {
  return Object.assign(new Jogador(), {
    id: 35,
    nome: 'Vitor Lima',
    posicao: PosicaoJogador.Atacante,
    condicao: CondicaoJogador.Apto,
    clubeId: 1,
    agilidade: 85,
    idade: 25,
    valorBase: '40.00',
    velocidade: 50,
    finalizacao: 50,
    passe: 50,
    drible: 50,
    defesa: 50,
    fisico: 50,
    potencial: 99,
    excluidoEm: null,
    ...alteracoes,
  });
}

export function createExampleLineups(): {
  mandante: EscalacaoFixture;
  visitante: EscalacaoFixture;
} {
  return {
    mandante: {
      clubeId: 1,
      formacao: FormacaoClube.DoisUmUm,
      titulares: [
        createPlayer({
          id: 30,
          nome: 'Rui Prado',
          posicao: PosicaoJogador.Goleiro,
          defesa: 77,
        }),
        createPlayer({
          id: 32,
          nome: 'Téo Brandão',
          posicao: PosicaoJogador.Zagueiro,
          defesa: 84,
        }),
        createPlayer({
          id: 31,
          nome: 'Davi Lins',
          posicao: PosicaoJogador.Lateral,
          condicao: CondicaoJogador.MalCondicionado,
          drible: 74,
          defesa: 66,
        }),
        createPlayer({
          id: 33,
          nome: 'Lauro Neves',
          posicao: PosicaoJogador.Meia,
          passe: 82,
        }),
        createPlayer({ id: 34, nome: 'Otto Rangel', finalizacao: 75 }),
      ],
    },
    visitante: {
      clubeId: 2,
      formacao: FormacaoClube.DoisUmUm,
      titulares: [
        createPlayer({
          id: 40,
          nome: 'Ivo Teles',
          clubeId: 2,
          posicao: PosicaoJogador.Goleiro,
          defesa: 72,
        }),
        createPlayer({
          id: 41,
          nome: 'Hugo Vaz',
          clubeId: 2,
          posicao: PosicaoJogador.Zagueiro,
          defesa: 84,
        }),
        createPlayer({
          id: 42,
          nome: 'Lino Matos',
          clubeId: 2,
          posicao: PosicaoJogador.Lateral,
          drible: 79,
          defesa: 63,
        }),
        createPlayer({
          id: 43,
          nome: 'Nei Soares',
          clubeId: 2,
          posicao: PosicaoJogador.Meia,
          passe: 70,
        }),
        createPlayer({
          id: 44,
          nome: 'Ugo Falcão',
          clubeId: 2,
          finalizacao: 81,
        }),
      ],
    },
  };
}
