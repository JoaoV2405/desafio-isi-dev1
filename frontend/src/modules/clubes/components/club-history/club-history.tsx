import { useMemo, useRef, useState } from 'react'
import { CircleAlert, Download, LoaderCircle } from 'lucide-react'
import type {
  TransactionsQuery,
  TransactionType,
} from '../../types/club-transactions'
import { useClubTransactions } from '../../hooks/use-club-transactions'
import { getTransactionPlayerOptions } from '../../lib/transaction-player-options'
import { exportClubTransactions } from '../../services/club-transactions-api'
import { transactionColumns } from './transaction-columns'
import { TransactionFilters } from './transaction-filters'
import { TransactionSummary } from './transaction-summary'
import { DataTable } from '@/components/data-table/data-table'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  ErrorAlert,
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'

export function ClubHistory({ clubId }: { clubId: number }) {
  const [types, setTypes] = useState<TransactionType[]>(['COMPRA', 'VENDA'])
  const [playerId, setPlayerId] = useState<number | null>(null)
  const [exportPending, setExportPending] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const exportInFlight = useRef(false)
  const query: TransactionsQuery = {
    type: types.length === 1 ? types[0] : undefined,
    player_id: playerId ?? undefined,
  }
  const transactions = useClubTransactions(clubId, query)
  const history = useClubTransactions(clubId)
  const playerOptions = useMemo(
    () => getTransactionPlayerOptions(history.data?.data ?? []),
    [history.data],
  )

  async function handleExport() {
    if (exportInFlight.current) return
    exportInFlight.current = true
    setExportPending(true)
    setExportError(null)
    try {
      const csv = await exportClubTransactions(clubId, query)
      const url = URL.createObjectURL(csv)
      const link = document.createElement('a')
      try {
        link.href = url
        link.download = `historico-clube-${clubId}.csv`
        document.body.appendChild(link)
        link.click()
        toast.add({
          type: 'success',
          title: 'CSV exportado com sucesso',
          timeout: 5000,
        })
      } finally {
        link.remove()
        // Dá tempo ao navegador para iniciar a leitura antes de liberar o arquivo.
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : 'Não foi possível exportar o CSV.',
      )
    } finally {
      exportInFlight.current = false
      setExportPending(false)
    }
  }

  const noTransactions = transactions.data?.data.length === 0
  const noPlayerTransactions = noTransactions && playerId !== null

  return (
    <section
      aria-label="Histórico de transações"
      className="space-y-5 p-4 text-foreground"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Histórico de transações</h2>
          <p className="text-sm text-muted-foreground">
            Da mais recente para a mais antiga, com o nome e os valores no
            momento de cada operação
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="ml-auto"
          disabled={
            exportPending || transactions.isPending || transactions.isError
          }
          onClick={() => void handleExport()}
        >
          {exportPending ? (
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin motion-reduce:animate-none"
            />
          ) : (
            <Download aria-hidden="true" />
          )}
          {exportPending ? 'Exportando...' : 'Exportar CSV'}
        </Button>
      </header>
      <TransactionFilters
        types={types}
        onTypesChange={(nextTypes) => {
          setTypes(nextTypes)
          setExportError(null)
        }}
        players={playerOptions}
        playerId={playerId}
        onPlayerChange={(nextPlayer) => {
          setPlayerId(nextPlayer)
          setExportError(null)
        }}
        disabled={exportPending}
      />
      {exportError && (
        <ErrorAlert
          title="Não foi possível exportar o CSV"
          descriptionClassName="whitespace-pre-line"
        >
          {exportError}
        </ErrorAlert>
      )}
      <div className="w-full overflow-hidden rounded-xl border">
        {transactions.isError ? (
          <ErrorAlert
            className="rounded-none border-0"
            title="Não foi possível carregar o histórico"
            descriptionClassName="space-y-2 whitespace-pre-line"
          >
            <p>{transactions.error.message}</p>
            <Button
              variant="outline"
              disabled={transactions.isFetching}
              onClick={() => void transactions.refetch()}
            >
              Tentar novamente
            </Button>
          </ErrorAlert>
        ) : noTransactions ? (
          <Alert
            variant={noPlayerTransactions ? 'destructive' : 'default'}
            className="rounded-none border-0"
          >
            <CircleAlert aria-hidden="true" />
            <AlertTitle>
              {noPlayerTransactions
                ? 'Nenhuma transação encontrada para este jogador'
                : 'Nenhuma transação registrada neste clube'}
            </AlertTitle>
            <AlertDescription>
              {noPlayerTransactions
                ? 'O jogador selecionado não possui transações neste histórico com os filtros atuais. Selecione outro jogador ou altere os tipos de operação.'
                : 'As compras e vendas do clube aparecerão aqui. Os totais são zero enquanto não houver transações.'}
            </AlertDescription>
          </Alert>
        ) : (
          <DataTable
            contained
            className="rounded-none border-0"
            data={transactions.data?.data ?? []}
            columns={transactionColumns}
            isLoading={transactions.isPending}
            loadingMessage="Carregando histórico de transações..."
            emptyMessage="Nenhuma transação registrada neste clube."
            getRowId={(transaction) => String(transaction.id)}
            caption={
              <span className="sr-only">
                Histórico de transações em moedas. Datas e horários de Brasília.
              </span>
            }
          />
        )}
        {!transactions.isError && transactions.data && (
          <TransactionSummary summary={transactions.data.summary} />
        )}
      </div>
    </section>
  )
}
