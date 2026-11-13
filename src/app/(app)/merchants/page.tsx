import { MerchantsView } from '@/components/merchants/MerchantsView'

export default function MerchantsPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-h5 text-text-primary">Merchants</h1>
      <MerchantsView />
    </section>
  )
}
