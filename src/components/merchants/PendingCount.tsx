import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'

export function PendingCount({ merchantId, count }: { merchantId: string; count: number }) {
  if (count === 0) return <span className="text-caption text-text-secondary">None</span>
  return (
    <Link href={`/merchants/${merchantId}/review`} aria-label={`${count} pending approvals for ${merchantId}`}>
      <Badge tone="warning">{count} pending</Badge>
    </Link>
  )
}
