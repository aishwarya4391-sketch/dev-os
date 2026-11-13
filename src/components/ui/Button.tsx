import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-white border border-brand hover:opacity-90 disabled:bg-bg-surface disabled:border-border-default disabled:text-text-disabled',
  secondary:
    'bg-bg-primary text-text-primary border border-border-default hover:bg-bg-subtle hover:border-border-strong disabled:bg-bg-surface disabled:text-text-disabled',
  ghost: 'bg-transparent text-text-primary border border-transparent hover:bg-bg-subtle disabled:text-text-disabled',
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        'inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-body transition-colors duration-100 ease-out disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
