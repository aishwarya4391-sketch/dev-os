import Link from 'next/link'
import { Banner } from '@/components/ui/Banner'
import { runCopy } from '@/lib/copy'
import type { Run } from '@/types/api'

export function RollbackBanner({
  merchantId,
  rolledBack,
}: {
  merchantId: string
  rolledBack: NonNullable<Run['rolled_back']>
}) {
  return (
    <Banner variant={rolledBack.verified ? 'danger' : 'warning'}>
      <div className="flex flex-col gap-1">
        <span>{runCopy.rolledBack(rolledBack.items, rolledBack.verified)}</span>
        {!rolledBack.verified && <span>{runCopy.rollbackUnverified}</span>}
        <Link className="underline" href={`/merchants/${merchantId}/history`}>
          View audit rows
        </Link>
      </div>
    </Banner>
  )
}
