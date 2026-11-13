import Link from 'next/link'
import { RunView } from '@/components/run/RunView'

export default function RunPage({ params }: { params: { id: string; runId: string } }) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href={`/merchants/${params.id}/upload`} className="text-caption text-brand underline">
          Back to upload
        </Link>
        <h1 className="text-h5 text-text-primary">Reconcile run · {params.id}</h1>
      </div>
      <RunView merchantId={params.id} runId={params.runId} />
    </section>
  )
}
