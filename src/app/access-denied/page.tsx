import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { authCopy } from '@/lib/copy'

export default function AccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-surface p-4">
      <Card className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-h5 text-text-primary">{authCopy.forbidden}</h1>
        <Link href="/merchants" className="text-caption text-brand underline">
          Back to merchants
        </Link>
      </Card>
    </main>
  )
}
