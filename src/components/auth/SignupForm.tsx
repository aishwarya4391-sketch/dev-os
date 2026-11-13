'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/auth/supabase-browser'
import { authCopy } from '@/lib/copy'
import { signUpSchema, type SignUpValues } from '@/lib/validation/auth'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function SignupForm() {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) })

  async function onSubmit(values: SignUpValues) {
    setFormError(null)
    try {
      const { data, error } = await createClient().auth.signUp({
        email: values.email,
        password: values.password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        setFormError(
          error.message.toLowerCase().includes('already') ? authCopy.emailTaken : error.message
        )
        return
      }
      // Supabase returns an empty identities list for an already-registered email.
      if (data.user && data.user.identities?.length === 0) {
        setFormError(authCopy.emailTaken)
        return
      }
      router.replace(`/verify?email=${encodeURIComponent(values.email)}`)
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
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>
      <p className="text-caption text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="text-brand underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
