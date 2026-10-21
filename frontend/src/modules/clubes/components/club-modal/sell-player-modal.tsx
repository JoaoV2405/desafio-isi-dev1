import type { ClubPlayer } from '../../types/club-details'
import { useClubLineup } from '../../hooks/use-club-lineup'
import { Modal } from '@/components/modal/modal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { PlayerIdentity } from '@/shared/components/player-identity'
import { formatDateTime } from '@/shared/lib/format-date-time'
import { formatMoney } from '@/shared/lib/format-money'

interface SellPlayerModalProps {
  player: ClubPlayer
  clubId: number
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isSubmitting: boolean
  error?: string
}

export function SellPlayerModal({
  player,
  clubId,
  onOpenChange,
  onConfirm,
  isSubmitting,
  error,
}: SellPlayerModalProps) {
  const lineup = useClubLineup(clubId)
  const isCheckingLineup = lineup.isPending || lineup.isFetching
  const isStarter = lineup.data?.players.some(
    (starter) => starter.id === player.id,
  )
  const blocked = isCheckingLineup || lineup.isError

  return (
    <Modal
      open
      onOpenChange={onOpenChange}
      title="Vender jogador"
      subtitle="Confirme a venda para liberar o jogador do clube."
      primaryAction={{
        label: 'Confirmar venda',
        pendingLabel: 'Vendendo...',
        disabled: blocked,
        onClick: () => {
          if (!blocked && !isSubmitting) onConfirm()
        },
      }}
      isSubmitting={isSubmitting}
    >
      <div className="rounded-xl border bg-muted/30 p-4">
        <PlayerIdentity
          playerId={player.id}
          name={player.name}
          position={player.position}
          age={player.age}
        />
      </div>
      <dl className="divide-y rounded-xl border px-4">
        {[
          {
            label: 'Valor de compra',
            value: `${formatMoney(player.contract.purchase_value)} moedas`,
          },
          {
            label: 'Valor de mercado atual',
            value: `${formatMoney(player.market_value)} moedas`,
          },
          {
            label: 'Fim da fidelidade',
            value: formatDateTime(player.contract.loyalty_until),
          },
          { label: 'Dias restantes', value: player.contract.remaining_days },
          {
            label: 'Percentual da multa',
            value: `${player.contract.penalty_rate}%`,
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-4 py-3 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-muted-foreground">
        Os valores finais da venda, da multa e da comissão serão apresentados
        após a confirmação.
      </p>
      {isCheckingLineup && (
        <p role="status" className="text-sm text-muted-foreground">
          Verificando a escalação do clube...
        </p>
      )}
      {lineup.isError && (
        <Alert variant="destructive">
          <AlertDescription className="space-y-2">
            <p className="whitespace-pre-line">{lineup.error.message}</p>
            <Button
              type="button"
              variant="outline"
              disabled={isCheckingLineup || isSubmitting}
              onClick={() => void lineup.refetch()}
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {!isCheckingLineup && !lineup.isError && isStarter && (
        <Alert variant="warning" role="status">
          <AlertDescription>
            {player.name} é titular. A venda o removerá da escalação e deixará a
            equipe incompleta.
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="whitespace-pre-line">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </Modal>
  )
}
