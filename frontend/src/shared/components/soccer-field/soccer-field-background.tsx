import { SOCCER_FIELD_GEOMETRY } from './geometry'
import type { FieldPresentation } from './types'
import { cn } from '@/lib/utils'

interface SoccerFieldBackgroundProps {
  presentation: FieldPresentation
  className?: string
}

/** Decorative background only. Position overlays relative to its full viewBox. */
export function SoccerFieldBackground({
  presentation,
  className,
}: SoccerFieldBackgroundProps) {
  const { width, height, boundary } = SOCCER_FIELD_GEOMETRY[presentation]

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio={presentation === 'match' ? 'none' : 'xMidYMid meet'}
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-presentation={presentation}
      className={cn('block h-auto w-full', className)}
    >
      <rect
        width={width}
        height={height}
        rx={presentation === 'match' ? 0 : 6}
        fill="#0D542B"
      />
      <rect {...boundary} stroke="white" strokeOpacity="0.4" />
      {presentation === 'lineup' ? (
        <>
          <rect
            x="3"
            y="16.5"
            width="34"
            height="1"
            fill="white"
            fillOpacity="0.4"
          />
          <rect
            x="11.5"
            y="42.5"
            width="17"
            height="6"
            stroke="white"
            strokeOpacity="0.4"
          />
          <circle cx="20" cy="17" r="4.5" stroke="white" strokeOpacity="0.4" />
        </>
      ) : (
        <g stroke="white" strokeOpacity="0.4">
          <path d="M52 4V64" />
          <circle cx="52" cy="34" r="9" />
          <circle cx="52" cy="34" r="0.6" fill="white" stroke="none" />
          <rect x="4" y="20" width="12" height="28" />
          <rect x="88" y="20" width="12" height="28" />
        </g>
      )}
    </svg>
  )
}
