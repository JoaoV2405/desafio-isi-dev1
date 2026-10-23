import { projectRoster } from '../../index.js';
import {
  CondicaoJogador,
  Jogador,
  PosicaoJogador,
} from '../../entities/jogador.entity.js';
import * as calculos from '../calculos-jogador.js';

function criarJogador(alteracoes: Partial<Jogador> = {}): Jogador {
  return Object.assign(new Jogador(), {
    id: 1,
    nome: 'Meia Lua',
    posicao: PosicaoJogador.Meia,
    agilidade: 85,
    idade: 25,
    valorBase: '40.00',
    condicao: CondicaoJogador.Apto,
    clubeId: 9,
    velocidade: 70,
    finalizacao: 68,
    passe: 82,
    drible: 79,
    defesa: 55,
    fisico: 64,
    potencial: 86,
    ...alteracoes,
  });
}

describe('projectRoster pela interface pública de jogadores', () => {
  afterEach(() => vi.restoreAllMocks());

  it('retorna elenco vazio e total zero sem executar cálculos', () => {
    const mercado = vi.spyOn(calculos, 'calcularValorMercadoEmCentavos');
    const overall = vi.spyOn(calculos, 'calcularOverall');

    expect(projectRoster([])).toEqual({ players: [], squadValueInCents: 0 });
    expect(mercado).not.toHaveBeenCalled();
    expect(overall).not.toHaveBeenCalled();
  });

  it('ordena por posição, nome normalizado e id sem modificar as entradas', () => {
    const jogadores = Object.freeze(
      [
        criarJogador({ id: 10, posicao: PosicaoJogador.Atacante }),
        criarJogador({ id: 9, nome: 'ÁNA Lima' }),
        criarJogador({ id: 4, nome: 'Ana-Maria Lima' }),
        criarJogador({ id: 7, nome: 'ana lima' }),
        criarJogador({ id: 6, nome: 'Épsilon Lima' }),
        criarJogador({ id: 3, posicao: PosicaoJogador.Lateral }),
        criarJogador({ id: 2, posicao: PosicaoJogador.Zagueiro }),
        criarJogador({ id: 1, posicao: PosicaoJogador.Goleiro }),
      ].map((jogador) => Object.freeze(jogador)),
    );
    const ordemOriginal = jogadores.map(({ id }) => id);

    const resultado = projectRoster(jogadores);

    expect(resultado.players.map(({ id }) => id)).toEqual([
      1, 2, 3, 7, 9, 4, 6, 10,
    ]);
    expect(jogadores.map(({ id }) => id)).toEqual(ordemOriginal);
    expect(jogadores.every((jogador) => jogador.valorBase === '40.00')).toBe(
      true,
    );
  });

  it('compara nomes por pontos Unicode, incluindo caracteres fora do plano básico', () => {
    const resultado = projectRoster([
      criarJogador({ id: 1, nome: '\u{10428} Lima' }),
      criarJogador({ id: 2, nome: '\uff41 Lima' }),
    ]);

    expect(resultado.players.map(({ id }) => id)).toEqual([2, 1]);
  });

  it('apresenta todos os campos sem depender de services ou repositories', () => {
    const jogador = criarJogador({ condicao: CondicaoJogador.MalCondicionado });

    const resultado = projectRoster([jogador]);

    expect(resultado).toEqual({
      squadValueInCents: 3_700,
      players: [
        {
          id: 1,
          name: 'Meia Lua',
          position: PosicaoJogador.Meia,
          agility: 85,
          age: 25,
          condition: CondicaoJogador.MalCondicionado,
          base_value: 40,
          market_value: 37,
          pace: 70,
          shooting: 68,
          passing: 82,
          dribbling: 79,
          defending: 55,
          physical: 64,
          potential: 86,
          overall: 75,
          club_id: 9,
        },
      ],
    });
    expect(resultado.players[0]).not.toBe(jogador);
  });

  it('soma em centavos os valores já arredondados de cada jogador', () => {
    const resultado = projectRoster([
      criarJogador({ id: 1, valorBase: '1.05', idade: 20 }),
      criarJogador({ id: 2, valorBase: '1.05', idade: 20 }),
    ]);

    expect(resultado.players.map(({ market_value }) => market_value)).toEqual([
      1.16, 1.16,
    ]);
    expect(resultado.squadValueInCents).toBe(232);
  });

  it('calcula mercado e overall uma vez por jogador e reaproveita o mercado no total', () => {
    const mercado = vi.spyOn(calculos, 'calcularValorMercadoEmCentavos');
    const overall = vi.spyOn(calculos, 'calcularOverall');

    const resultado = projectRoster([
      criarJogador(),
      criarJogador({ id: 2, condicao: CondicaoJogador.MalCondicionado }),
    ]);

    expect(resultado.squadValueInCents).toBe(7_700);
    expect(mercado).toHaveBeenCalledTimes(2);
    expect(overall).toHaveBeenCalledTimes(2);
  });

  it('recalcula a projeção após uma mudança de condição sem armazenar derivados no jogador', () => {
    const jogador = criarJogador();
    expect(projectRoster([jogador]).squadValueInCents).toBe(4_000);

    jogador.condicao = CondicaoJogador.MalCondicionado;

    const resultado = projectRoster([jogador]);
    expect(resultado.squadValueInCents).toBe(3_700);
    expect(resultado.players[0]?.market_value).toBe(37);
    expect(jogador).not.toHaveProperty('overall');
    expect(jogador).not.toHaveProperty('market_value');
    expect(jogador.valorBase).toBe('40.00');
  });

  it('projeta todos os 12 jogadores do elenco sem paginação', () => {
    const jogadores = Array.from({ length: 12 }, (_, index) =>
      criarJogador({ id: index + 1 }),
    );

    const resultado = projectRoster(jogadores);

    expect(resultado.players).toHaveLength(12);
    expect(resultado.squadValueInCents).toBe(48_000);
  });
});
