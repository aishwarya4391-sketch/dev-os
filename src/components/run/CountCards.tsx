import type { Run } from '@/types/api'

const CARDS: { key: keyof Run['counts']; label: string }[] = [
  { key: 'committed', label: 'Committed' },
  { key: 'pending', label: 'Pending approval' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'skipped', label: 'Skipped' },
  { key: 'rolled_back', label: 'Rolled back' },
]

export function CountCards({ counts }: { counts: Run['counts'] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {CARDS.map(({ key, label }) => (
        <div key={key} className="flex flex-col gap-0.5 rounded-lg border border-border-default bg-bg-primary p-4">
          <dt className="text-caption text-text-secondary">{label}</dt>
          <dd className="text-h5 text-text-primary">{counts[key]}</dd>
        </div>
      ))}
    </dl>
  )
}
