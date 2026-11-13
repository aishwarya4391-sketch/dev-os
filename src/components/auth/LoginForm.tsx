'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/auth/supabase-browser'
import { safeNext } from '@/lib/auth/safe-next'
import { authCopy } from '@/lib/copy'
import { signInSchema, type SignInValues } from '@/lib/validation/auth'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) })

  async function onSubmit(values: SignInValues) {
    setFormError(null)
    try {
      const { error } = await createClient().auth.signInWithPassword(values)
      if (error) {
        setFormError(
          error.message.toLowerCase().includes('not confirmed')
            ? authCopy.emailNotVerified
            : authCopy.invalidCredentials
        )
        return
      }
      router.replace(safeNext(next))
      router.refresh()
    } catch {
      setFormError(authCopy.network)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {formError && <Banner variant="danger">{formError}</Banner>}
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
      <p className="text-caption text-text-secondary">
        No account?{' '}
        <Link href="/signup" className="text-brand underline">
          Sign up
        </Link>
      </p>
    </form>
  )
}
