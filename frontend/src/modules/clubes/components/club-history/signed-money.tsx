import { formatMoney } from '@/shared/lib/format-money'

export function SignedMoney({ value }: { value: number | null }) {
  if (value === null || value === 0) {
    return (
      <span
        className="text-muted-foreground"
        aria-label={value === null ? 'Não se aplica' : 'Zero moedas'}
      >
        -
      </span>
    )
  }

  return (
    <span className={value < 0 ? 'text-destructive' : 'text-success'}>
      {value > 0 ? '+' : ''}
      {formatMoney(value)}
    </span>
  )
}
