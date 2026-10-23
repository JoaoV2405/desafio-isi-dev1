import { FormacaoClube } from '../../clubes/entities/clube.entity.js';
import {
  CondicaoJogador,
  type Jogador,
  PosicaoJogador,
} from '../../jogadores/entities/jogador.entity.js';
import {
  isComposicaoEscalacaoValida,
  isEscalacaoCompleta,
} from './escalacao.validator.js';

type Titular = Pick<
  Jogador,
  'id' | 'posicao' | 'clubeId' | 'condicao' | 'excluidoEm'
>;

const {
  Goleiro: GOL,
  Zagueiro: ZAG,
  Lateral: LAT,
  Meia: MEI,
  Atacante: ATA,
} = PosicaoJogador;

const clube = { id: 7, formacao: FormacaoClube.DoisUmUm };

function criarTitulares(
  posicoes: readonly PosicaoJogador[] = [GOL, ZAG, LAT, MEI, ATA],
): Titular[] {
  return posicoes.map((posicao, indice) => ({
    id: indice + 1,
    posicao,
    clubeId: clube.id,
    condicao: CondicaoJogador.Apto,
    excluidoEm: null,
  }));
}

describe('escalação completa', () => {
  it.each([
    [FormacaoClube.TresUm, [GOL, ZAG, LAT, LAT, ATA]],
    [FormacaoClube.DoisDois, [ATA, LAT, GOL, ZAG, ATA]],
    [FormacaoClube.DoisUmUm, [GOL, ZAG, LAT, MEI, ATA]],
    [FormacaoClube.UmDoisUm, [GOL, LAT, MEI, MEI, ATA]],
  ])(
    'aceita os titulares válidos da formação %s sem alterá-los',
    (formacao, posicoes) => {
      const titulares = Object.freeze(
        criarTitulares(posicoes).map((jogador) => Object.freeze(jogador)),
      );

      expect(isEscalacaoCompleta({ ...clube, formacao }, titulares)).toBe(true);
    },
  );

  it('aceita titulares MAL_CONDICIONADO em qualquer posição', () => {
    const titulares = criarTitulares().map((jogador) => ({
      ...jogador,
      condicao: CondicaoJogador.MalCondicionado,
    }));

    expect(isEscalacaoCompleta(clube, titulares)).toBe(true);
  });

  it('recusa clube sem formação, mesmo com cinco titulares', () => {
    const semFormacao = { ...clube, formacao: null };

    expect(isEscalacaoCompleta(semFormacao, [])).toBe(false);
    expect(isEscalacaoCompleta(semFormacao, criarTitulares())).toBe(false);
  });

  it.each([
    [],
    [GOL, ZAG, LAT, MEI],
    [GOL, ZAG, LAT, MEI, ATA, ATA],
    [GOL, GOL, LAT, MEI, ATA],
    [ZAG, ZAG, LAT, MEI, ATA],
    [GOL, ZAG, LAT, ATA, ATA],
  ])('recusa quantidade ou composição inválida: %j', (...posicoes) => {
    expect(isEscalacaoCompleta(clube, criarTitulares(posicoes))).toBe(false);
  });

  it.each<{
    descricao: string;
    alteracoes: Partial<Titular>;
  }>([
    { descricao: 'livre', alteracoes: { clubeId: null } },
    { descricao: 'de outro clube', alteracoes: { clubeId: 8 } },
    { descricao: 'doente', alteracoes: { condicao: CondicaoJogador.Doente } },
    {
      descricao: 'excluído',
      alteracoes: { excluidoEm: new Date('2026-10-20T12:00:00Z') },
    },
  ])('recusa escalação com titular $descricao', ({ alteracoes }) => {
    const titulares = criarTitulares();
    titulares[4] = { ...titulares[4], ...alteracoes };

    expect(isEscalacaoCompleta(clube, titulares)).toBe(false);
  });

  it('recusa id repetido mesmo quando a distribuição das posições fecha a formação', () => {
    const titulares = criarTitulares([GOL, LAT, MEI, MEI, ATA]);
    titulares[3] = { ...titulares[2] };

    expect(
      isEscalacaoCompleta(
        { ...clube, formacao: FormacaoClube.UmDoisUm },
        titulares,
      ),
    ).toBe(false);
  });
});

describe('composição da escalação', () => {
  it.each([
    [FormacaoClube.TresUm, [GOL, ZAG, LAT, LAT, ATA]],
    [FormacaoClube.DoisDois, [ATA, LAT, GOL, ZAG, ATA]],
    [FormacaoClube.DoisUmUm, [GOL, ZAG, LAT, MEI, ATA]],
    [FormacaoClube.UmDoisUm, [GOL, LAT, MEI, MEI, ATA]],
  ])('aceita os cinco titulares da formação %s', (formation, positions) => {
    expect(
      isComposicaoEscalacaoValida(
        formation,
        positions.map((posicao) => ({ posicao })),
      ),
    ).toBe(true);
  });

  it.each([
    [GOL, GOL, ZAG, MEI, ATA],
    [ZAG, ZAG, LAT, MEI, ATA],
    [GOL, ZAG, LAT, ATA, ATA],
    [GOL, ZAG, LAT, MEI],
    [GOL, ZAG, LAT, MEI, ATA, ATA],
  ])('recusa composição diferente da formação', (...positions) => {
    expect(
      isComposicaoEscalacaoValida(
        FormacaoClube.DoisUmUm,
        positions.map((posicao) => ({ posicao })),
      ),
    ).toBe(false);
  });
});
