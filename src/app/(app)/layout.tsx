import { createClient } from '@/lib/auth/supabase-server'
import { roleFromUser } from '@/lib/auth/roles'
import { SignOutButton } from '@/components/layout/SignOutButton'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { data } = await createClient().auth.getUser()
  const role = roleFromUser(data.user)

  return (
    <div className="min-h-screen bg-bg-surface">
      <header className="flex h-16 items-center justify-between border-b border-border-default bg-bg-primary px-6">
        <span className="text-body text-text-primary">Menu Reconciliation Agent</span>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-caption text-text-primary">{data.user?.email}</span>
            <span className="text-caption text-text-secondary">{role}</span>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
