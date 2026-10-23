import { CondicaoJogador, PosicaoJogador } from '../entities/jogador.entity.js';
import {
  calcularOverall,
  calcularValorBaseEmCentavos,
  calcularValorMercadoEmCentavos,
} from './calculos-jogador.js';

describe('cálculos de jogador', () => {
  it('calcula o overall usando os pesos da posição e meio para cima', () => {
    expect(
      calcularOverall(PosicaoJogador.Zagueiro, {
        velocidade: 50,
        finalizacao: 90,
        passe: 60,
        drible: 40,
        defesa: 80,
        fisico: 75,
      }),
    ).toBe(73);
  });

  it.each([
    [75, 86, 25, 4_000],
    [76, 80, 22, 4_600],
    [70, 84, 21, 3_420],
    [45, 90, 18, 363],
    [40, 66, 36, 100],
  ])(
    'calcula o valor base para overall %i, potencial %i e idade %i',
    (overall, potencial, idade, esperado) => {
      expect(calcularValorBaseEmCentavos(overall, potencial, idade)).toBe(
        esperado,
      );
    },
  );

  it.each([
    ['82.00', CondicaoJogador.Apto, 50, 19, 9_020],
    ['82.00', CondicaoJogador.MalCondicionado, 80, 21, 8_405],
    ['82.00', CondicaoJogador.Doente, 10, 40, 4_920],
    ['9.50', CondicaoJogador.MalCondicionado, 85, 25, 879],
    ['1.00', CondicaoJogador.MalCondicionado, 50, 35, 100],
  ])(
    'calcula o valor de mercado de %s para condição %s',
    (valorBase, condicao, agilidade, idade, esperado) => {
      expect(
        calcularValorMercadoEmCentavos(valorBase, condicao, agilidade, idade),
      ).toBe(esperado);
    },
  );
});
