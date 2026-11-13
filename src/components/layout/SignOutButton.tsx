'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/auth/supabase-browser'
import { Button } from '@/components/ui/Button'

export function SignOutButton() {
  const router = useRouter()
  async function signOut() {
    await createClient().auth.signOut()
    router.replace('/login')
    router.refresh()
  }
  return (
    <Button variant="secondary" onClick={signOut}>
      Sign out
    </Button>
  )
}
