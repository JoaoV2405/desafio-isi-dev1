import { createExampleLineups } from '../../../../test/fixtures/partida.fixture.js';
import { FormacaoClube } from '../../clubes/entities/clube.entity.js';
import {
  CondicaoJogador,
  PosicaoJogador,
} from '../../jogadores/entities/jogador.entity.js';
import { AtributoDuelo } from '../entities/duelo-partida.entity.js';
import {
  calculateDuels,
  calculateEffectiveAttribute,
  calculateResult,
  calculateScore,
} from './calculos-partida.js';

const {
  Goleiro: GOL,
  Zagueiro: ZAG,
  Lateral: LAT,
  Meia: MEI,
  Atacante: ATA,
} = PosicaoJogador;
const { Finalizacao: SHO, Passe: PAS, Drible: DRI } = AtributoDuelo;

describe('cálculos da partida', () => {
  it.each([
    [1, 1],
    [50, 43],
    [66, 56],
    [74, 63],
    [99, 84],
  ])('aplica 85%% e meio para cima: %i → %i', (valor, esperado) => {
    expect(
      calculateEffectiveAttribute(valor, CondicaoJogador.MalCondicionado),
    ).toBe(esperado);
    expect(calculateEffectiveAttribute(valor, CondicaoJogador.Apto)).toBe(
      valor,
    );
  });

  it('reproduz os seis duelos e o placar 1×2 do exemplo da RN20', () => {
    const { mandante, visitante } = createExampleLineups();
    const duelos = calculateDuels(mandante, visitante);

    expect(
      duelos.map((duelo) => [
        duelo.ordem,
        duelo.clubeAtacanteId,
        duelo.atacanteId,
        duelo.defensorId,
        duelo.atributoAtaque,
        duelo.valorAtaque,
        duelo.valorDefesa,
        duelo.gol,
      ]),
    ).toEqual([
      [1, 1, 34, 40, SHO, 75, 72, true],
      [2, 1, 33, 41, PAS, 82, 84, false],
      [3, 1, 31, 42, DRI, 63, 63, false],
      [4, 2, 44, 30, SHO, 81, 77, true],
      [5, 2, 43, 32, PAS, 70, 84, false],
      [6, 2, 42, 31, DRI, 79, 56, true],
    ]);
    expect(duelos[2]).toEqual({
      ordem: 3,
      clubeAtacanteId: 1,
      atacanteId: 31,
      defensorId: 42,
      nomeAtacante: 'Davi Lins',
      nomeDefensor: 'Lino Matos',
      posicaoAtacante: LAT,
      posicaoDefensor: LAT,
      condicaoAtacante: CondicaoJogador.MalCondicionado,
      condicaoDefensor: CondicaoJogador.Apto,
      atributoAtaque: DRI,
      atributoDefesa: AtributoDuelo.Defesa,
      valorAtaque: 63,
      valorDefesa: 63,
      gol: false,
    });
    expect(calculateScore(duelos)).toEqual({
      golsMandante: 1,
      golsVisitante: 2,
      resultado: 'VISITANTE',
    });
    expect(calculateScore([...duelos].reverse())).toEqual(
      calculateScore(duelos),
    );
  });

  it.each([
    [FormacaoClube.TresUm, [GOL, ZAG, LAT, LAT, ATA], [SHO, DRI, DRI]],
    [FormacaoClube.DoisDois, [GOL, ZAG, LAT, ATA, ATA], [SHO, SHO, DRI]],
    [FormacaoClube.DoisUmUm, [GOL, ZAG, LAT, MEI, ATA], [SHO, PAS, DRI]],
    [FormacaoClube.UmDoisUm, [GOL, ZAG, MEI, MEI, ATA], [SHO, PAS, PAS]],
  ])(
    'seleciona os atributos e pareamentos da formação %s',
    (formacao, posicoes, atributos) => {
      const { mandante, visitante } = createExampleLineups();
      for (const time of [mandante, visitante]) {
        time.formacao = formacao;
        time.titulares.forEach((jogador, indice) => {
          jogador.posicao = posicoes[indice];
        });
      }
      const duelos = calculateDuels(mandante, visitante);

      expect(
        duelos.map(({ atacanteId, defensorId }) => [atacanteId, defensorId]),
      ).toEqual([
        [34, 40],
        [33, 41],
        [31, 42],
        [44, 30],
        [43, 32],
        [42, 31],
      ]);
      expect(duelos.map(({ atributoAtaque }) => atributoAtaque)).toEqual([
        ...atributos,
        ...atributos,
      ]);
      expect(
        duelos.every(
          ({ atributoDefesa }) => atributoDefesa === AtributoDuelo.Defesa,
        ),
      ).toBe(true);
    },
  );

  it('usa drible quando um ZAG está entre os três atacantes', () => {
    const { mandante, visitante } = createExampleLineups();
    mandante.formacao = FormacaoClube.TresUm;
    mandante.titulares[2].posicao = ZAG;
    mandante.titulares[3].posicao = ZAG;

    expect(calculateDuels(mandante, visitante)[1]).toMatchObject({
      posicaoAtacante: ZAG,
      atributoAtaque: DRI,
      valorAtaque: 50,
    });
  });

  it('reduz ataque e defesa do goleiro separadamente antes de comparar o empate', () => {
    const { mandante, visitante } = createExampleLineups();
    mandante.titulares[4].condicao = CondicaoJogador.MalCondicionado;
    mandante.titulares[4].finalizacao = 50;
    visitante.titulares[0].condicao = CondicaoJogador.MalCondicionado;
    visitante.titulares[0].defesa = 50;

    expect(calculateDuels(mandante, visitante)[0]).toMatchObject({
      valorAtaque: 43,
      valorDefesa: 43,
      posicaoDefensor: GOL,
      gol: false,
      condicaoAtacante: CondicaoJogador.MalCondicionado,
      condicaoDefensor: CondicaoJogador.MalCondicionado,
    });
  });

  it.each([
    [99, 99, 99, 99, 0, 0, 'EMPATE'],
    [99, 1, 99, 1, 3, 3, 'EMPATE'],
    [99, 99, 1, 1, 3, 0, 'MANDANTE'],
    [1, 1, 99, 99, 0, 3, 'VISITANTE'],
  ])(
    'calcula os limites do placar e executa todos os duelos: %j',
    (
      ataqueCasa,
      defesaCasa,
      ataqueFora,
      defesaFora,
      golsMandante,
      golsVisitante,
      resultado,
    ) => {
      const { mandante, visitante } = createExampleLineups();
      for (const [time, ataque, defesa] of [
        [mandante, ataqueCasa, defesaCasa],
        [visitante, ataqueFora, defesaFora],
      ] as const) {
        for (const jogador of time.titulares) {
          Object.assign(jogador, {
            condicao: CondicaoJogador.Apto,
            finalizacao: ataque,
            passe: ataque,
            drible: ataque,
            defesa,
          });
        }
      }
      const duelos = calculateDuels(mandante, visitante);
      expect(duelos).toHaveLength(6);
      expect(calculateScore(duelos)).toEqual({
        golsMandante,
        golsVisitante,
        resultado,
      });
      expect(calculateResult(golsMandante, golsVisitante)).toBe(resultado);
    },
  );

  it('é determinístico sem modificar os jogadores nem os arrays de entrada', () => {
    const { mandante, visitante } = createExampleLineups();
    for (const time of [mandante, visitante]) {
      time.titulares.forEach((jogador) => Object.freeze(jogador));
      Object.freeze(time.titulares);
      Object.freeze(time);
    }
    expect(calculateDuels(mandante, visitante)).toEqual(
      calculateDuels(mandante, visitante),
    );
  });

  it('ignora idade, agilidade, potencial e valor base no placar', () => {
    const { mandante, visitante } = createExampleLineups();
    const antes = calculateDuels(mandante, visitante);
    for (const jogador of [...mandante.titulares, ...visitante.titulares]) {
      Object.assign(jogador, {
        idade: 40,
        agilidade: 1,
        potencial: 99,
        valorBase: '9999.00',
        velocidade: 1,
        fisico: 1,
      });
    }
    expect(calculateDuels(mandante, visitante)).toEqual(antes);
  });
});
