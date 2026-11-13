import { clsx } from 'clsx'
import type { ReactNode } from 'react'

type Variant = 'info' | 'success' | 'warning' | 'danger'

const styles: Record<Variant, string> = {
  info: 'bg-brand-bg border-brand text-text-primary',
  success: 'bg-success-bg border-success text-success-text',
  warning: 'bg-warning-bg border-warning text-warning-text',
  danger: 'bg-danger-bg border-danger text-danger-text',
}

export function Banner({ variant = 'info', children }: { variant?: Variant; children: ReactNode }) {
  return (
    <div
      role={variant === 'danger' ? 'alert' : 'status'}
      className={clsx('rounded-md border px-3 py-2 text-caption', styles[variant])}
    >
      {children}
    </div>
  )
}
