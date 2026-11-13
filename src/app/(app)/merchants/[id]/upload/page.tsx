import Link from 'next/link'
import { UploadView } from '@/components/upload/UploadView'

export default function UploadPage({ params }: { params: { id: string } }) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/merchants" className="text-caption text-brand underline">
          Merchants
        </Link>
        <h1 className="text-h5 text-text-primary">Upload POS export · {params.id}</h1>
      </div>
      <UploadView merchantId={params.id} />
    </section>
  )
}
