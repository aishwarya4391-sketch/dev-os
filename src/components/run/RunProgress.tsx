import { Stepper } from '@/components/ui/Stepper'
import { runCopy } from '@/lib/copy'
import type { RunStep } from '@/types/api'

const ORDER = ['reading_upload', 'matching', 'staging', 'routing', 'committing', 'verifying'] as const

const STEPS = ORDER.map((key) => ({ key, label: runCopy.steps[key] }))

export function RunProgress({ step }: { step: RunStep }) {
  const index = step === 'done' ? ORDER.length : Math.max(0, ORDER.indexOf(step as (typeof ORDER)[number]))
  return (
    <div role="status" aria-live="polite" className="rounded-lg border border-border-default bg-bg-primary p-6">
      <Stepper steps={STEPS} currentIndex={index} />
    </div>
  )
}
