import type { ComponentProps } from 'react'

export function FootballIcon(props: ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m12 7 4.8 3.5-1.9 5.6H9.1l-1.9-5.6L12 7Zm0 0V2m4.8 8.5 4.7-1.6m-6.6 7.2 3 4m-9-4-3 4m1.3-9.6L2.5 8.9" />
    </svg>
  )
}
