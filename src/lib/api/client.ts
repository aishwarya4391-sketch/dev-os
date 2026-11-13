import { createClient } from '@/lib/auth/supabase-browser'
import { API_BASE_URL } from '@/lib/constants'
import type { ApiErrorBody } from '@/types/api'

export class ApiError extends Error {
  status: number
  code: string
  requestId: string
  details?: Record<string, unknown>

  constructor(status: number, code: string, message: string, requestId = '', details?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.requestId = requestId
    this.details = details
  }
}

const DEFAULT_TIMEOUT_MS = 30_000

type RequestOptions = RequestInit & { timeoutMs?: number }

async function accessToken(): Promise<string | null> {
  const { data } = await createClient().auth.getSession()
  return data.session?.access_token ?? null
}

async function handleUnauthenticated() {
  await createClient().auth.signOut()
  if (typeof window !== 'undefined') window.location.assign('/login')
}

async function request(path: string, init: RequestOptions, accept: string): Promise<Response> {
  if (!API_BASE_URL) {
    throw new ApiError(0, 'not_configured', 'The web app address is not configured.')
  }

  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers, ...rest } = init
  const token = await accessToken()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        Accept: accept,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      signal: controller.signal,
    })
  } catch {
    throw new ApiError(0, 'network', "Can't reach the server. Check your connection and try again.")
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    let body: Partial<ApiErrorBody> = {}
    try {
      body = await res.json()
    } catch {
      // Non-JSON error body; fall through to generic mapping.
    }
    const err = body.error
    if (res.status === 401) await handleUnauthenticated()
    throw new ApiError(
      res.status,
      err?.code ?? 'unknown',
      err?.message ?? 'Something went wrong.',
      err?.request_id,
      err?.details
    )
  }
  return res
}

export async function apiFetch<T>(path: string, init: RequestOptions = {}): Promise<T> {
  const res = await request(path, init, 'application/json')
  return (await res.json()) as T
}

/** For JSON POST/PUT bodies. */
export function jsonBody(payload: unknown): Pick<RequestInit, 'body' | 'headers'> {
  return { body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }
}

/** Authenticated file download (the bearer token can't be sent by a bare link). */
export async function apiDownload(path: string, filename: string, init: RequestOptions = {}): Promise<void> {
  const res = await request(path, init, '*/*')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
