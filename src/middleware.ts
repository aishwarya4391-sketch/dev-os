import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { hasRole, roleFromUser, type Role } from '@/lib/auth/roles'

const PUBLIC_PATHS = ['/login', '/signup', '/verify', '/auth/callback']

function requiredRole(pathname: string): Role | null {
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/settings')) return 'lead'
  if (pathname.startsWith('/merchants')) return 'specialist'
  return null
}

function redirectTo(request: NextRequest, path: string, base: NextResponse) {
  const url = request.nextUrl.clone()
  url.pathname = path
  url.search = ''
  const res = NextResponse.redirect(url)
  base.cookies.getAll().forEach((c) => res.cookies.set(c))
  return res
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase =
    url && anon
      ? createServerClient(url, anon, {
          cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: (items) => {
              items.forEach(({ name, value }) => request.cookies.set(name, value))
              response = NextResponse.next({ request })
              items.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
            },
          },
        })
      : null

  const user = supabase ? (await supabase.auth.getUser()).data.user : null
  const verified = !!user?.email_confirmed_at
  const role = roleFromUser(user)

  if (PUBLIC_PATHS.includes(pathname)) {
    if (pathname !== '/auth/callback' && user && verified) return redirectTo(request, '/merchants', response)
    return response
  }

  const needed = requiredRole(pathname)
  if (needed === null) return response

  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = `?next=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(loginUrl)
  }
  if (!verified) return redirectTo(request, '/verify', response)
  if (!hasRole(role, needed)) return redirectTo(request, '/access-denied', response)
  if (pathname.startsWith('/admin') && process.env.NEXT_PUBLIC_ENABLE_DEMO_CONTROLS !== 'true') {
    return redirectTo(request, '/access-denied', response)
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
