import { VerifyNotice } from '@/components/auth/VerifyNotice'

export default function VerifyPage({ searchParams }: { searchParams: { email?: string } }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-h5 text-text-primary">Verify your email</h2>
      <VerifyNotice email={searchParams.email} />
    </div>
  )
}
