import { SignupForm } from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-h5 text-text-primary">Create account</h2>
      <SignupForm />
    </div>
  )
}
