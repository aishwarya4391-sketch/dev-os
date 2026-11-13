'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/auth/supabase-browser'
import { authCopy } from '@/lib/copy'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'

export function VerifyNotice({ email }: { email?: string }) {
  const [message, setMessage] = useState<{ variant: 'success' | 'danger'; text: string } | null>(null)
  const [sending, setSending] = useState(false)

  async function resend() {
    if (!email) return
    setSending(true)
    try {
      const { error } = await createClient().auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      setMessage(
        error ? { variant: 'danger', text: error.message } : { variant: 'success', text: authCopy.verifyResent }
      )
    } catch {
      setMessage({ variant: 'danger', text: authCopy.network })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Banner variant="info">{email ? `${authCopy.verifySent} (${email})` : authCopy.emailNotVerified}</Banner>
      {message && <Banner variant={message.variant}>{message.text}</Banner>}
      {email && (
        <Button variant="secondary" onClick={resend} disabled={sending}>
          {sending ? 'Sending…' : 'Resend verification email'}
        </Button>
      )}
      <Link href="/login" className="text-caption text-brand underline">
        Back to sign in
      </Link>
    </div>
  )
}
