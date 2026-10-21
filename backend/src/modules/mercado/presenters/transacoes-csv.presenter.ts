import { formatarDataBrasilia } from '../../../core/date/formatar-data-brasilia.js';
import {
  centavosParaDecimal,
  decimalParaCentavos,
} from '../../../core/money/conversoes-monetarias.js';
import type { Transacao } from '../entities/transacao.entity.js';

const CABECALHO =
  'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa';

export function presentTransactionsCsv(
  transacoes: readonly Transacao[],
): string {
  const linhas = transacoes.map((transacao) =>
    [
      formatarDataBrasilia(transacao.criadoEm),
      transacao.tipo,
      escapePlayerName(transacao.nomeJogador),
      formatMoney(transacao.valor),
      formatMoney(transacao.taxa),
      formatMoney(transacao.multa),
      transacao.lucro === null ? '' : formatMoney(transacao.lucro),
      formatMoney(transacao.variacaoCaixa),
    ].join(';'),
  );

  return [CABECALHO, ...linhas].join('\n') + '\n';
}

function formatMoney(valor: string): string {
  return centavosParaDecimal(decimalParaCentavos(valor)).replace('.', ',');
}

function escapePlayerName(nome: string): string {
  return /[;"]/.test(nome) ? `"${nome.replaceAll('"', '""')}"` : nome;
}
