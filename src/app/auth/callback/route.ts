import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/auth/supabase-server'
import { safeNext } from '@/lib/auth/safe-next'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))

  if (code) {
    const { error } = await createClient().auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  return NextResponse.redirect(`${origin}/login`)
}
