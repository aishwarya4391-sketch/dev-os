import Link from 'next/link'
import type { Run } from '@/types/api'
import { AgentExplanation } from './AgentExplanation'
import { CountCards } from './CountCards'
import { RollbackBanner } from './RollbackBanner'

export function RunSummary({ run }: { run: Run }) {
  return (
    <div className="flex flex-col gap-4">
      {run.rolled_back && <RollbackBanner merchantId={run.merchant_id} rolledBack={run.rolled_back} />}
      <CountCards counts={run.counts} />
      {run.explanation && <AgentExplanation text={run.explanation} />}
      <div className="flex gap-4 text-caption">
        <Link className="text-brand underline" href={`/merchants/${run.merchant_id}/review`}>
          Go to review queue
        </Link>
        <Link className="text-brand underline" href={`/merchants/${run.merchant_id}/history`}>
          View history
        </Link>
      </div>
    </div>
  )
}
