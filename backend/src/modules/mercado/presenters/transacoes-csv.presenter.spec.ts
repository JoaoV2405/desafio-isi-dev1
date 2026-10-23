import { Transacao, TipoTransacao } from '../entities/transacao.entity.js';
import { presentTransactionsCsv } from './transacoes-csv.presenter.js';

const CABECALHO =
  'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n';

function createTransaction(overrides: Partial<Transacao> = {}): Transacao {
  return Object.assign(new Transacao(), {
    nomeJogador: 'Meia Lua',
    tipo: TipoTransacao.Compra,
    valor: '37.00',
    taxa: '1.85',
    multa: '0.00',
    lucro: null,
    variacaoCaixa: '-38.85',
    criadoEm: new Date('2026-11-02T13:15:00.987Z'),
    ...overrides,
  });
}

describe('CSV de transações (RN18)', () => {
  it('retorna somente o cabeçalho exato com LF quando não há transações', () => {
    expect(presentTransactionsCsv([])).toBe(CABECALHO);
  });

  it('reproduz o exemplo oficial com duas casas, sinal, lucro nulo e LF final', () => {
    const venda = createTransaction({
      tipo: TipoTransacao.Venda,
      valor: '40.00',
      taxa: '0.30',
      multa: '4.00',
      lucro: '3.00',
      variacaoCaixa: '35.70',
      criadoEm: new Date('2026-11-05T19:40:00Z'),
    });
    const csv = presentTransactionsCsv([venda, createTransaction()]);

    expect(csv).toBe(
      CABECALHO +
        '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70\n' +
        '2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85\n',
    );
    expect(csv).not.toContain('\r');
    expect(Buffer.from(csv, 'utf8').subarray(0, 3)).not.toEqual(
      Buffer.from([0xef, 0xbb, 0xbf]),
    );
  });

  it.each([
    ['José Ávila', 'José Ávila'],
    ['Zé; Lima', '"Zé; Lima"'],
    ['Zé "Foguete" Lima', '"Zé ""Foguete"" Lima"'],
    ['Zé "Foguete"; Lima', '"Zé ""Foguete""; Lima"'],
  ])('preserva e escapa o nome histórico %s', (nomeJogador, esperado) => {
    expect(presentTransactionsCsv([createTransaction({ nomeJogador })])).toBe(
      CABECALHO +
        `2026-11-02T10:15:00-03:00;COMPRA;${esperado};37,00;1,85;0,00;;-38,85\n`,
    );
  });

  it('distingue lucro zero e prejuízo e preserva centavos e limites monetários', () => {
    const csv = presentTransactionsCsv([
      createTransaction({
        tipo: TipoTransacao.Venda,
        valor: '0.01',
        taxa: '0',
        multa: '0.1',
        lucro: '0.00',
        variacaoCaixa: '-0.09',
      }),
      createTransaction({
        tipo: TipoTransacao.Venda,
        valor: '9999.99',
        lucro: '-99999.99',
        variacaoCaixa: '-999999.99',
      }),
    ]);
    expect(csv).toContain(';0,01;0,00;0,10;0,00;-0,09\n');
    expect(csv).toContain(';9999,99;1,85;0,00;-99999,99;-999999,99\n');
  });

  it('converte a virada do ano para Brasília sem milissegundos', () => {
    expect(
      presentTransactionsCsv([
        createTransaction({ criadoEm: new Date('2027-01-01T01:02:03.456Z') }),
      ]),
    ).toContain('2026-12-31T22:02:03-03:00;');
  });
});
