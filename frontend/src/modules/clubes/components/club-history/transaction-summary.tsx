import {
  BadgePercent,
  HandCoins,
  ReceiptText,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import type { TransactionsSummary } from '../../types/club-transactions'
import { SignedMoney } from './signed-money'
import { SummaryCard } from '@/components/custom/summary-card'
import { formatMoney } from '@/shared/lib/format-money'

export function TransactionSummary({
  summary,
}: {
  summary: TransactionsSummary
}) {
  const ProfitIcon = summary.total_profit < 0 ? TrendingDown : TrendingUp

  return (
    <footer
      aria-label="Resumo das transações filtradas"
      className="grid gap-px border-t bg-border md:grid-cols-5 [&>article]:rounded-none [&>article]:border-0"
    >
      <SummaryCard
        title="Total pago em compras"
        value={formatMoney(summary.total_spent)}
        unit="moedas"
        icon={<ShoppingCart className="size-5" />}
        iconPosition="left"
        description="Valor dos jogadores e taxas de compra"
      />
      <SummaryCard
        title="Total recebido em vendas"
        value={formatMoney(summary.total_received)}
        unit="moedas"
        icon={<HandCoins className="size-5" />}
        iconPosition="left"
        description="Crédito líquido recebido pelo clube"
      />
      <SummaryCard
        title="Taxas e comissões"
        value={formatMoney(summary.total_fees)}
        unit="moedas"
        icon={<BadgePercent className="size-5" />}
        iconPosition="left"
        description="Taxas de compra e comissões de venda"
      />
      <SummaryCard
        title="Multas"
        value={formatMoney(summary.total_penalties)}
        unit="moedas"
        icon={<ReceiptText className="size-5" />}
        iconPosition="left"
        description="Multas por encerramento da fidelidade"
      />
      <SummaryCard
        title="Lucro total"
        value={
          summary.total_profit === 0 ? (
            formatMoney(0)
          ) : (
            <SignedMoney value={summary.total_profit} />
          )
        }
        unit="moedas"
        iconPosition="left"
        icon={
          <ProfitIcon
            className={`size-5 ${summary.total_profit < 0 ? 'text-destructive' : summary.total_profit > 0 ? 'text-success' : 'text-muted-foreground'}`}
          />
        }
        description="Soma dos lucros e prejuízos nas vendas"
      />
    </footer>
  )
}
