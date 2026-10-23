import {
  FormacaoClube,
  type Clube,
} from '../../clubes/entities/clube.entity.js';
import {
  CondicaoJogador,
  type Jogador,
  PosicaoJogador,
} from '../../jogadores/entities/jogador.entity.js';

type JogadorComPosicao = Pick<Jogador, 'posicao'>;

export function isFormacaoClube(value: unknown): value is FormacaoClube {
  return Object.values(FormacaoClube).some((formacao) => formacao === value);
}

export function isComposicaoEscalacaoValida(
  formacao: FormacaoClube,
  jogadores: readonly JogadorComPosicao[],
): boolean {
  // Compara as posições do elenco com as quantidades exigidas por cada formação.
  const quantidadeGoleiros = jogadores.filter(
    (jogador) => jogador.posicao === PosicaoJogador.Goleiro,
  ).length;
  const quantidadeDefensores = jogadores.filter(
    (jogador) =>
      jogador.posicao === PosicaoJogador.Zagueiro ||
      jogador.posicao === PosicaoJogador.Lateral,
  ).length;
  const quantidadeMeias = jogadores.filter(
    (jogador) => jogador.posicao === PosicaoJogador.Meia,
  ).length;
  const quantidadeAtacantes = jogadores.filter(
    (jogador) => jogador.posicao === PosicaoJogador.Atacante,
  ).length;
  const quantidadeJogadoresDeLinha =
    quantidadeDefensores + quantidadeMeias + quantidadeAtacantes;
  const composicaoEsperada = {
    [FormacaoClube.TresUm]: { defensores: 3, meias: 0, atacantes: 1 },
    [FormacaoClube.DoisDois]: { defensores: 2, meias: 0, atacantes: 2 },
    [FormacaoClube.DoisUmUm]: { defensores: 2, meias: 1, atacantes: 1 },
    [FormacaoClube.UmDoisUm]: { defensores: 1, meias: 2, atacantes: 1 },
  }[formacao];

  return (
    quantidadeGoleiros === 1 &&
    quantidadeJogadoresDeLinha === 4 &&
    quantidadeDefensores === composicaoEsperada.defensores &&
    quantidadeMeias === composicaoEsperada.meias &&
    quantidadeAtacantes === composicaoEsperada.atacantes
  );
}

type TitularEscalacao = Pick<
  Jogador,
  'id' | 'posicao' | 'clubeId' | 'condicao' | 'excluidoEm'
>;

export function isEscalacaoCompleta(
  clube: Pick<Clube, 'id' | 'formacao'>,
  jogadores: readonly TitularEscalacao[],
): boolean {
  return (
    jogadores.length === 5 &&
    isFormacaoClube(clube.formacao) &&
    new Set(jogadores.map((jogador) => jogador.id)).size === 5 &&
    jogadores.every(
      (jogador) =>
        jogador.clubeId === clube.id &&
        (jogador.condicao === CondicaoJogador.Apto ||
          jogador.condicao === CondicaoJogador.MalCondicionado) &&
        jogador.excluidoEm === null,
    ) &&
    isComposicaoEscalacaoValida(clube.formacao, jogadores)
  );
}
