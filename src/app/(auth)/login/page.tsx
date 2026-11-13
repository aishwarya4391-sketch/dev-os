import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-h5 text-text-primary">Sign in</h2>
      <LoginForm next={searchParams.next} />
    </div>
  )
}
