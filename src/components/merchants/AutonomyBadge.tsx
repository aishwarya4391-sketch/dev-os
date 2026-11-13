import { Badge } from '@/components/ui/Badge'
import type { Autonomy } from '@/types/api'

const LABELS: Record<Autonomy, { label: string; tone: 'neutral' | 'info' | 'warning' }> = {
  shadow: { label: 'Shadow', tone: 'neutral' },
  suggest: { label: 'Suggest', tone: 'info' },
  auto_low_risk: { label: 'Auto low-risk', tone: 'warning' },
}

export function AutonomyBadge({ autonomy }: { autonomy: Autonomy }) {
  const { label, tone } = LABELS[autonomy]
  return <Badge tone={tone}>{label}</Badge>
}
