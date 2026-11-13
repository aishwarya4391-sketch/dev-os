import { Card } from '@/components/ui/Card'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-surface p-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-h5 text-text-primary">Menu Reconciliation Agent</h1>
          <p className="text-caption text-text-secondary">Specialist workspace</p>
        </div>
        <Card>{children}</Card>
      </div>
    </main>
  )
}
