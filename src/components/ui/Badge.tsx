import { clsx } from 'clsx'
import type { ReactNode } from 'react'

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

// Semantic status badge pattern from docs/design.md: tinted bg, matching border, strong text.
const tones: Record<Tone, string> = {
  neutral: 'bg-bg-subtle border-border-strong text-text-primary',
  info: 'bg-brand-bg border-brand text-brand',
  success: 'bg-success-bg border-success text-success-text',
  warning: 'bg-warning-bg border-warning text-warning-text',
  danger: 'bg-danger-bg border-danger text-danger-text',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-caption',
        tones[tone]
      )}
    >
      {children}
    </span>
  )
}
