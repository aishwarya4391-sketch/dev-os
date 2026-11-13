import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { relativeTime } from '@/lib/format/time'
import type { MerchantSummary, RunStatus } from '@/types/api'
import { AutonomyBadge } from './AutonomyBadge'
import { PendingCount } from './PendingCount'

const RUN_STATUS: Record<RunStatus, { label: string; tone: 'neutral' | 'info' | 'success' | 'danger' }> = {
  queued: { label: 'Queued', tone: 'info' },
  running: { label: 'Running', tone: 'info' },
  succeeded: { label: 'Succeeded', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
  timed_out: { label: 'Timed out', tone: 'danger' },
}

export function MerchantTable({ merchants }: { merchants: MerchantSummary[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border-default bg-bg-primary">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border-default bg-bg-surface">
            {['Merchant', 'Autonomy', 'Last run', 'Pending approvals', 'Actions'].map((h) => (
              <th key={h} scope="col" className="px-4 py-3 text-caption text-text-secondary">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {merchants.map((m) => (
            <tr key={m.merchant_id} className="border-b border-border-default last:border-b-0 hover:bg-bg-subtle">
              <td className="px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-body text-text-primary">{m.name}</span>
                  <span className="text-caption text-text-secondary">{m.merchant_id}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <AutonomyBadge autonomy={m.autonomy} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-caption text-text-primary">{relativeTime(m.last_run_at)}</span>
                  {m.active_run_id ? (
                    <Badge tone="info">Run in progress</Badge>
                  ) : (
                    m.last_run_status && (
                      <Badge tone={RUN_STATUS[m.last_run_status].tone}>{RUN_STATUS[m.last_run_status].label}</Badge>
                    )
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <PendingCount merchantId={m.merchant_id} count={m.pending_count} />
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-4 text-caption">
                  <Link className="text-brand underline" href={`/merchants/${m.merchant_id}/upload`}>
                    Upload
                  </Link>
                  <Link className="text-brand underline" href={`/merchants/${m.merchant_id}/review`}>
                    Review
                  </Link>
                  <Link className="text-brand underline" href={`/merchants/${m.merchant_id}/history`}>
                    History
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
