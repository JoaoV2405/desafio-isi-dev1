import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { getAgilityColor } from '@/shared/lib/player-presentation'

const agilityColors = {
  red: '[&_[data-slot=progress-indicator]]:bg-red-500',
  gray: '[&_[data-slot=progress-indicator]]:bg-gray-400',
  green: '[&_[data-slot=progress-indicator]]:bg-green-500',
}

export function AgilityIndicator({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-right tabular-nums">{value}</span>
      <Progress
        value={Math.max(0, Math.min(value, 100))}
        max={100}
        aria-label="Agilidade"
        className={cn('w-20', agilityColors[getAgilityColor(value)])}
      />
    </div>
  )
}
