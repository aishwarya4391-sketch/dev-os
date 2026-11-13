import { Check } from 'lucide-react'
import { clsx } from 'clsx'

export type StepItem = { key: string; label: string }

/** Ordered progress list. `currentIndex` is the active step; earlier steps are done. */
export function Stepper({
  steps,
  currentIndex,
  failed = false,
}: {
  steps: StepItem[]
  currentIndex: number
  failed?: boolean
}) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, i) => {
        const done = i < currentIndex
        const current = i === currentIndex
        return (
          <li key={step.key} className="flex items-center gap-3" aria-current={current ? 'step' : undefined}>
            <span
              className={clsx(
                'flex h-6 w-6 items-center justify-center rounded-full border text-caption',
                done && 'border-success bg-success-bg text-success-text',
                current && !failed && 'border-brand bg-brand-bg text-brand',
                current && failed && 'border-danger bg-danger-bg text-danger-text',
                !done && !current && 'border-border-default bg-bg-primary text-text-disabled'
              )}
            >
              {done ? <Check size={14} aria-hidden /> : i + 1}
            </span>
            <span className={clsx('text-body', done || current ? 'text-text-primary' : 'text-text-disabled')}>
              {step.label}
              {done && <span className="sr-only"> (done)</span>}
              {current && <span className="sr-only"> (in progress)</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
