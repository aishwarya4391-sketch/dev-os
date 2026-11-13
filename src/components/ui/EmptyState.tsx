import type { ReactNode } from 'react'

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-border-default bg-bg-primary px-6 py-12 text-center">
      <p className="text-body text-text-primary">{title}</p>
      {children && <div className="text-caption text-text-secondary">{children}</div>}
    </div>
  )
}
