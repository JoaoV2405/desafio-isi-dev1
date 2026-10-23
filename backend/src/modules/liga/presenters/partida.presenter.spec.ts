import {
  createPlayer,
  createRecordedMatch,
} from '../../../../test/fixtures/partida.fixture.js';
import {
  CondicaoJogador,
  PosicaoJogador,
} from '../../jogadores/entities/jogador.entity.js';
import { PartidaPresenter } from './partida.presenter.js';

describe('PartidaPresenter', () => {
  it('devolve somente o resumo externo com formações e placar históricos', () => {
    const partida = createRecordedMatch();
    expect(PartidaPresenter.presentSummary(partida)).toEqual({
      id: 9,
      played_at: '2026-10-20T16:00:49-03:00',
      home: {
        club_id: 1,
        club_name: 'Águias FC',
        formation: '2-1-1',
        goals: 1,
      },
      away: { club_id: 2, club_name: 'Delta FC', formation: '2-1-1', goals: 2 },
      result: 'VISITANTE',
    });
  });

  it('mapeia snapshots e ordena os duelos sem modificar a entrada', () => {
    const partida = createRecordedMatch();
    partida.duelos.reverse();
    partida.duelos[3].atacante = createPlayer({
      id: 31,
      nome: 'Nome Atual',
      posicao: PosicaoJogador.Atacante,
      condicao: CondicaoJogador.Doente,
      finalizacao: 99,
    });
    const detalhe = PartidaPresenter.presentDetail(partida);
    expect(detalhe.duels.map(({ order }) => order)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(partida.duelos.map(({ ordem }) => ordem)).toEqual([
      6, 5, 4, 3, 2, 1,
    ]);
    expect(detalhe.duels[2]).toEqual({
      order: 3,
      attacking_club_id: 1,
      attacker: {
        player_id: 31,
        player_name: 'Davi Lins',
        position: 'LAT',
        condition: 'MAL_CONDICIONADO',
        attribute: 'dribbling',
        value: 63,
      },
      defender: {
        player_id: 42,
        player_name: 'Lino Matos',
        position: 'LAT',
        condition: 'APTO',
        attribute: 'defending',
        value: 63,
      },
      goal: false,
    });
  });

  it.each([
    [3, 0, 'MANDANTE'],
    [0, 3, 'VISITANTE'],
    [0, 0, 'EMPATE'],
  ])(
    'deriva o resultado do placar %i×%i',
    (golsMandante, golsVisitante, result) => {
      const partida = createRecordedMatch();
      Object.assign(partida, { golsMandante, golsVisitante });
      expect(PartidaPresenter.presentSummary(partida).result).toBe(result);
    },
  );
});
