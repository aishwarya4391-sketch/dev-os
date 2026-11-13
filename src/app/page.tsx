import { redirect } from 'next/navigation'
import { createClient } from '@/lib/auth/supabase-server'

export default async function Home() {
  const hasEnv = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!hasEnv) redirect('/login')
  const { data } = await createClient().auth.getUser()
  redirect(data.user ? '/merchants' : '/login')
}
