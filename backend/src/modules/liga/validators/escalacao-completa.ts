import type { Clube } from '../../clubes/entities/clube.entity.js';
import {
  CondicaoJogador,
  type Jogador,
} from '../../jogadores/entities/jogador.entity.js';
import {
  isComposicaoEscalacaoValida,
  isFormacaoClube,
} from '../services/formacao-validation.service.js';

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
