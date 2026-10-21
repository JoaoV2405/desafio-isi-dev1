import { FormacaoClube } from '../../clubes/entities/clube.entity.js';
import { PosicaoJogador } from '../../jogadores/entities/jogador.entity.js';
import { isComposicaoEscalacaoValida } from './formacao-validation.service.js';

const {
  Goleiro: GOL,
  Zagueiro: ZAG,
  Lateral: LAT,
  Meia: MEI,
  Atacante: ATA,
} = PosicaoJogador;

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
